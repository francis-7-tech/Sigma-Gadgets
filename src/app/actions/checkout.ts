"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { cartItems, orderItems, orders, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { checkoutSchema, type CheckoutField as Field } from "@/lib/checkout-schema";
import { sendOrderConfirmation } from "@/lib/order-email";
import { notifyCartChanged } from "@/lib/realtime";
import { deliveryFeeKobo, PAYMENT_WINDOW_HOURS } from "@/lib/site";

export type CheckoutState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  values?: Partial<Record<Field, string>>;
} | null;

class CheckoutError extends Error {}

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await requireUser("/checkout");

  const values = Object.fromEntries(
    (["name", "phone", "address", "city", "state"] as const).map((f) => [f, String(formData.get(f) ?? "")]),
  ) as Record<Field, string>;
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) {
    const errors: Partial<Record<Field, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as Field;
      errors[field] ??= issue.message;
    }
    return { errors, values };
  }
  const shipping = parsed.data;

  let orderId: string;
  try {
    orderId = await db.transaction(async (tx) => {
      const lines = await tx
        .select({
          productId: products.id,
          name: products.name,
          priceKobo: products.priceKobo,
          stock: products.stock,
          quantity: cartItems.quantity,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, user.id))
        .for("update", { of: products });

      if (lines.length === 0) throw new CheckoutError("Your cart is empty.");
      const short = lines.find((line) => line.quantity > line.stock);
      if (short) {
        throw new CheckoutError(
          short.stock === 0
            ? `${short.name} has just sold out. Please remove it from your cart.`
            : `Only ${short.stock} × ${short.name} left. Please update your cart.`,
        );
      }

      const subtotalKobo = lines.reduce((total, line) => total + line.priceKobo * line.quantity, 0);
      const [order] = await tx
        .insert(orders)
        .values({
          userId: user.id,
          subtotalKobo,
          deliveryFeeKobo,
          totalKobo: subtotalKobo + deliveryFeeKobo,
          shippingName: shipping.name,
          shippingPhone: shipping.phone,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingState: shipping.state,
          expiresAt: new Date(Date.now() + PAYMENT_WINDOW_HOURS * 60 * 60 * 1000),
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        lines.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          productName: line.name,
          unitPriceKobo: line.priceKobo,
          quantity: line.quantity,
        })),
      );

      for (const line of lines) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${line.quantity}` })
          .where(eq(products.id, line.productId));
      }

      await tx.delete(cartItems).where(eq(cartItems.userId, user.id));
      return order.id;
    });
  } catch (error) {
    if (error instanceof CheckoutError) return { message: error.message, values };
    console.error("[checkout] Could not place order:", error);
    return { message: "We couldn't place your order. Please try again.", values };
  }

  await Promise.all([sendOrderConfirmation(orderId), notifyCartChanged(user.id)]);

  revalidatePath("/", "layout");
  redirect(`/orders/${orderId}`);
}

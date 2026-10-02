"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { cartItems, products } from "@/db/schema";
import { getSession, requireUser, safeCallbackUrl } from "@/lib/auth";

export type AddToCartState = { ok: boolean; message: string } | null;

const addSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(20),
  returnTo: z.string().default("/"),
});

export async function addToCart(_prev: AddToCartState, formData: FormData): Promise<AddToCartState> {
  const parsed = addSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Something went wrong. Please try again." };
  const { productId, quantity, returnTo } = parsed.data;

  const session = await getSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(safeCallbackUrl(returnTo))}`);
  }
  const userId = session.user.id;

  const [product] = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId));
  if (!product) return { ok: false, message: "This product is no longer available." };
  if (product.stock < 1) return { ok: false, message: "Sorry, this item is out of stock." };

  const [existing] = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  const current = existing?.quantity ?? 0;
  const next = Math.min(current + quantity, product.stock);
  if (next === current) {
    return { ok: false, message: `You already have all ${product.stock} available in your cart.` };
  }

  await db
    .insert(cartItems)
    .values({ userId, productId, quantity: next })
    .onConflictDoUpdate({
      target: [cartItems.userId, cartItems.productId],
      set: { quantity: next, updatedAt: new Date() },
    });

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: next < current + quantity ? `Added (only ${product.stock} available)` : "Added to cart",
  };
}

const updateSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(0).max(99),
});

export async function updateCartQuantity(formData: FormData): Promise<void> {
  const user = await requireUser("/cart");
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { productId, quantity } = parsed.data;
  const where = and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId));

  if (quantity === 0) {
    await db.delete(cartItems).where(where);
  } else {
    const [product] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, productId));
    const allowed = Math.min(quantity, Math.max(product?.stock ?? 0, 1));
    await db.update(cartItems).set({ quantity: allowed, updatedAt: new Date() }).where(where);
  }
  revalidatePath("/", "layout");
}

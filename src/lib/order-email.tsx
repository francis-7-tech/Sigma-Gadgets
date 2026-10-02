import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orderItems, orders, users } from "@/db/schema";
import OrderConfirmation from "@/emails/OrderConfirmation";
import { sendEmail } from "@/lib/email";
import { formatNaira } from "@/lib/money";
import { bankDetails, formatDate, shopWhatsApp, shopWhatsAppUrl, siteUrl } from "@/lib/site";

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  try {
    const [order] = await db
      .select({ order: orders, email: users.email, name: users.name })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId));
    if (!order?.email || order.order.emailSentAt) return;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .orderBy(asc(orderItems.id));
    const o = order.order;

    const result = await sendEmail({
      to: { email: order.email, name: order.name ?? undefined },
      subject: `Order ${o.orderNumber} received – complete your payment`,
      react: (
        <OrderConfirmation
          firstName={order.name?.trim().split(/\s+/)[0] || null}
          orderNumber={o.orderNumber}
          orderDate={formatDate(o.createdAt)}
          items={items.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            lineTotal: formatNaira(item.unitPriceKobo * item.quantity),
          }))}
          subtotal={formatNaira(o.subtotalKobo)}
          deliveryFee={formatNaira(o.deliveryFeeKobo)}
          total={formatNaira(o.totalKobo)}
          bankName={bankDetails.bankName}
          accountName={bankDetails.accountName}
          accountNumber={bankDetails.accountNumber}
          shippingLine={`${o.shippingName}, ${o.shippingAddress}, ${o.shippingCity}, ${o.shippingState} · ${o.shippingPhone}`}
          orderUrl={`${siteUrl}/orders/${o.id}`}
          whatsApp={shopWhatsApp}
          whatsAppUrl={shopWhatsAppUrl}
        />
      ),
    });

    if (result.sent) {
      await db.update(orders).set({ emailSentAt: new Date() }).where(eq(orders.id, orderId));
    }
  } catch (error) {
    console.error(`[order-email] Could not send confirmation for order ${orderId}:`, error);
  }
}

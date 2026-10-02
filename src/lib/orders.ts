import { and, asc, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { orderItems, orders, products } from "@/db/schema";

export type OrderStatus = (typeof orders.$inferSelect)["status"];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export async function getOrdersForUser(userId: string) {
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalKobo: orders.totalKobo,
      createdAt: orders.createdAt,
      itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`.mapWith(Number),
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.userId, userId))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt));
}

export async function getOrderForUser(orderId: string, userId: string) {
  if (!z.uuid().safeParse(orderId).success) return null;
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id));
  return { ...order, items };
}

export async function cancelExpiredOrders(): Promise<string[]> {
  return db.transaction(async (tx) => {
    const expired = await tx
      .select({ id: orders.id, orderNumber: orders.orderNumber })
      .from(orders)
      .where(and(eq(orders.status, "pending"), lt(orders.expiresAt, new Date())))
      .for("update", { skipLocked: true });
    if (expired.length === 0) return [];

    const ids = expired.map((order) => order.id);
    const items = await tx
      .select({ productId: orderItems.productId, quantity: orderItems.quantity })
      .from(orderItems)
      .where(inArray(orderItems.orderId, ids));

    for (const item of items) {
      if (item.productId === null) continue;
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} + ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }
    await tx.update(orders).set({ status: "cancelled" }).where(inArray(orders.id, ids));
    return expired.map((order) => order.orderNumber);
  });
}

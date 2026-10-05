import { and, asc, eq, sum } from "drizzle-orm";
import { db } from "@/db/client";
import { cartItems, categories, products } from "@/db/schema";
import { notifyCartChanged } from "@/lib/realtime";
import { deliveryFeeKobo } from "@/lib/site";

export type AddToCartResult =
  | { ok: true; quantity: number; stock: number; limited: boolean }
  | { ok: false; reason: "product-not-found" | "out-of-stock" | "limit-reached"; stock: number };

export async function addItemToCart(userId: string, productId: number, quantity: number): Promise<AddToCartResult> {
  const [product] = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId));
  if (!product) return { ok: false, reason: "product-not-found", stock: 0 };
  if (product.stock < 1) return { ok: false, reason: "out-of-stock", stock: 0 };

  const [existing] = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  const current = existing?.quantity ?? 0;
  const next = Math.min(current + quantity, product.stock);
  if (next === current) return { ok: false, reason: "limit-reached", stock: product.stock };

  await db
    .insert(cartItems)
    .values({ userId, productId, quantity: next })
    .onConflictDoUpdate({
      target: [cartItems.userId, cartItems.productId],
      set: { quantity: next, updatedAt: new Date() },
    });
  await notifyCartChanged(userId);

  return { ok: true, quantity: next, stock: product.stock, limited: next < current + quantity };
}

export function describeAddToCart(result: AddToCartResult): string {
  if (result.ok) return result.limited ? `Added (only ${result.stock} available)` : "Added to cart";
  if (result.reason === "product-not-found") return "This product is no longer available.";
  if (result.reason === "out-of-stock") return "Sorry, this item is out of stock.";
  return `You already have all ${result.stock} available in your cart.`;
}

export type SetQuantityResult = { ok: true; quantity: number } | { ok: false; reason: "not-in-cart" };

export async function setCartItemQuantity(userId: string, productId: number, quantity: number): Promise<SetQuantityResult> {
  const where = and(eq(cartItems.userId, userId), eq(cartItems.productId, productId));

  if (quantity === 0) {
    const removed = await db.delete(cartItems).where(where).returning({ productId: cartItems.productId });
    if (removed.length) await notifyCartChanged(userId);
    return { ok: true, quantity: 0 };
  }

  const [product] = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId));
  const allowed = Math.min(quantity, Math.max(product?.stock ?? 0, 1));
  const updated = await db
    .update(cartItems)
    .set({ quantity: allowed, updatedAt: new Date() })
    .where(where)
    .returning({ productId: cartItems.productId });
  if (!updated.length) return { ok: false, reason: "not-in-cart" };

  await notifyCartChanged(userId);
  return { ok: true, quantity: allowed };
}

export async function getCart(userId: string) {
  const items = await db
    .select({
      productId: products.id,
      name: products.name,
      slug: products.slug,
      priceKobo: products.priceKobo,
      stock: products.stock,
      images: products.images,
      categoryName: categories.name,
      categorySlug: categories.slug,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(cartItems.userId, userId))
    .orderBy(asc(cartItems.createdAt));

  const lines = items.map((item) => ({
    ...item,
    lineTotalKobo: item.priceKobo * item.quantity,
    exceedsStock: item.quantity > item.stock,
  }));
  const subtotalKobo = lines.reduce((total, line) => total + line.lineTotalKobo, 0);
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  return {
    lines,
    itemCount,
    subtotalKobo,
    deliveryFeeKobo: lines.length ? deliveryFeeKobo : 0,
    totalKobo: subtotalKobo + (lines.length ? deliveryFeeKobo : 0),
    hasStockProblem: lines.some((line) => line.exceedsStock),
  };
}

export type Cart = Awaited<ReturnType<typeof getCart>>;

export async function getCartCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sum(cartItems.quantity).mapWith(Number) })
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
  return row?.count ?? 0;
}

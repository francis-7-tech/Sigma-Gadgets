import { asc, eq, sum } from "drizzle-orm";
import { db } from "@/db/client";
import { cartItems, categories, products } from "@/db/schema";
import { deliveryFeeKobo } from "@/lib/site";

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

import { and, asc, desc, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, products } from "@/db/schema";

const productFields = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  priceKobo: products.priceKobo,
  stock: products.stock,
  images: products.images,
  illustrativePhoto: products.illustrativePhoto,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  priceKobo: number;
  stock: number;
  images: string[];
  illustrativePhoto: boolean;
  categoryName: string;
  categorySlug: string;
};

export async function getCategoriesWithCounts() {
  const rows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug, productId: products.id })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .orderBy(asc(categories.sortOrder));

  const byId = new Map<number, { name: string; slug: string; count: number }>();
  for (const row of rows) {
    const entry = byId.get(row.id) ?? { name: row.name, slug: row.slug, count: 0 };
    if (row.productId !== null) entry.count += 1;
    byId.set(row.id, entry);
  }
  return [...byId.values()];
}

export async function getFeaturedProducts(): Promise<ProductSummary[]> {
  return db
    .select(productFields)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.featured, true))
    .orderBy(asc(categories.sortOrder), asc(products.id));
}

export type ProductSort = "newest" | "price-asc" | "price-desc";

export async function searchProducts(options: {
  category?: string;
  query?: string;
  sort?: ProductSort;
}): Promise<ProductSummary[]> {
  const filters: SQL[] = [];
  if (options.category) filters.push(eq(categories.slug, options.category));
  if (options.query) {
    const escaped = options.query.replace(/[\\%_]/g, (c) => `\\${c}`);
    filters.push(ilike(products.name, `%${escaped}%`));
  }

  const order =
    options.sort === "price-asc"
      ? [asc(products.priceKobo)]
      : options.sort === "price-desc"
        ? [desc(products.priceKobo)]
        : [desc(products.createdAt), desc(products.id)];

  return db
    .select(productFields)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(...order);
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select({
      ...productFields,
      description: products.description,
      specs: products.specs,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug));
  return product ?? null;
}

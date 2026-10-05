import { apiJson, validationError } from "@/lib/api";
import { toApiProduct } from "@/lib/api-serializers";
import { searchProducts } from "@/lib/catalog";
import { productQuerySchema } from "@/lib/catalog-schema";

export async function GET(request: Request) {
  const parsed = productQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return validationError(parsed.error);
  const { category, q, sort } = parsed.data;

  const products = await searchProducts({ category: category || undefined, query: q || undefined, sort });
  return apiJson({ products: products.map(toApiProduct) });
}

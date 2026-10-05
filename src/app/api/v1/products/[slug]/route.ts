import { apiError, apiJson } from "@/lib/api";
import { toApiProductDetail } from "@/lib/api-serializers";
import { getProductBySlug } from "@/lib/catalog";

export async function GET(_request: Request, context: RouteContext<"/api/v1/products/[slug]">) {
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);
  if (!product) return apiError(404, "product_not_found", "This product doesn't exist.");
  return apiJson({ product: toApiProductDetail(product) });
}

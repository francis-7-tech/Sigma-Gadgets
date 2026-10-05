import { apiError, apiJson, readJsonBody, unauthorized, validationError } from "@/lib/api";
import { getApiUser } from "@/lib/api-auth";
import { toApiCart } from "@/lib/api-serializers";
import { addItemToCart, describeAddToCart, getCart } from "@/lib/cart";
import { addItemBodySchema } from "@/lib/cart-schema";

export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const parsed = addItemBodySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return validationError(parsed.error);

  const result = await addItemToCart(user.id, parsed.data.productId, parsed.data.quantity);
  const message = describeAddToCart(result);
  if (!result.ok) {
    return result.reason === "product-not-found"
      ? apiError(404, "product_not_found", message)
      : apiError(409, result.reason === "out-of-stock" ? "out_of_stock" : "limit_reached", message);
  }

  return apiJson({ message, cart: toApiCart(await getCart(user.id)) });
}

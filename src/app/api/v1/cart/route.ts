import { apiJson, unauthorized } from "@/lib/api";
import { getApiUser } from "@/lib/api-auth";
import { toApiCart } from "@/lib/api-serializers";
import { getCart } from "@/lib/cart";

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  return apiJson({ cart: toApiCart(await getCart(user.id)) });
}

import { apiError, apiJson, readJsonBody, unauthorized, validationError } from "@/lib/api";
import { getApiUser } from "@/lib/api-auth";
import { toApiCart } from "@/lib/api-serializers";
import { getCart, setCartItemQuantity } from "@/lib/cart";
import { productIdParamSchema, quantityBodySchema } from "@/lib/cart-schema";

type Context = RouteContext<"/api/v1/cart/items/[productId]">;
type CartItemTarget = { userId: string; productId: number };

function notInCart(): Response {
  return apiError(404, "not_in_cart", "That item isn't in your cart.");
}

async function findTarget(request: Request, context: Context): Promise<CartItemTarget | Response> {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const productId = productIdParamSchema.safeParse((await context.params).productId);
  if (!productId.success) return notInCart();

  return { userId: user.id, productId: productId.data };
}

async function applyQuantity({ userId, productId }: CartItemTarget, quantity: number): Promise<Response> {
  const result = await setCartItemQuantity(userId, productId, quantity);
  if (!result.ok) return notInCart();
  return apiJson({ cart: toApiCart(await getCart(userId)) });
}

export async function PATCH(request: Request, context: Context) {
  const target = await findTarget(request, context);
  if (target instanceof Response) return target;

  const parsed = quantityBodySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return validationError(parsed.error);

  return applyQuantity(target, parsed.data.quantity);
}

export async function DELETE(request: Request, context: Context) {
  const target = await findTarget(request, context);
  if (target instanceof Response) return target;

  return applyQuantity(target, 0);
}

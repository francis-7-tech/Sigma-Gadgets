"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, requireUser, safeCallbackUrl } from "@/lib/auth";
import { addToCartFormSchema, setQuantitySchema } from "@/lib/cart-schema";
import { addItemToCart, describeAddToCart, setCartItemQuantity } from "@/lib/cart";

export type AddToCartState = { ok: boolean; message: string } | null;

export async function addToCart(_prev: AddToCartState, formData: FormData): Promise<AddToCartState> {
  const parsed = addToCartFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Something went wrong. Please try again." };
  const { productId, quantity, returnTo } = parsed.data;

  const session = await getSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(safeCallbackUrl(returnTo))}`);
  }

  const result = await addItemToCart(session.user.id, productId, quantity);
  if (result.ok) revalidatePath("/", "layout");
  return { ok: result.ok, message: describeAddToCart(result) };
}

export async function updateCartQuantity(formData: FormData): Promise<void> {
  const user = await requireUser("/cart");
  const parsed = setQuantitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await setCartItemQuantity(user.id, parsed.data.productId, parsed.data.quantity);
  revalidatePath("/", "layout");
}

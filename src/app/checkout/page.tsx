import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/app/checkout/checkout-form";
import { ProductImage } from "@/components/product-image";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatNaira } from "@/lib/money";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const cart = await getCart(user.id);
  if (cart.lines.length === 0 || cart.hasStockProblem) redirect("/cart");

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-18 pt-7">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Link href="/cart" className="underline underline-offset-3">
          Cart
        </Link>
        <span aria-hidden="true">/</span>
        <span>Checkout</span>
      </nav>
      <h1 className="mt-2.5 font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold tracking-tight">Checkout</h1>

      <CheckoutForm
        user={{ name: user.name ?? "", email: user.email ?? "", image: user.image ?? null }}
        summary={
          <>
            {cart.lines.map((line) => (
              <div key={line.productId} className="flex items-center gap-3">
                <div className="relative size-13 shrink-0 overflow-hidden rounded-control border border-border bg-white">
                  <ProductImage publicId={line.images[0]} categorySlug={line.categorySlug} alt="" sizes="52px" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold leading-snug">{line.name}</span>
                  <span className="text-sm text-muted-foreground">Qty {line.quantity}</span>
                </div>
                <span className="font-semibold tabular-nums">{formatNaira(line.lineTotalKobo)}</span>
              </div>
            ))}
            <hr className="border-border" />
            <div className="flex justify-between text-[15px]">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold tabular-nums">{formatNaira(cart.subtotalKobo)}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-semibold tabular-nums">{formatNaira(cart.deliveryFeeKobo)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex items-baseline justify-between text-lg">
              <strong>Total</strong>
              <span className="text-2xl font-bold tabular-nums">{formatNaira(cart.totalKobo)}</span>
            </div>
          </>
        }
      />
    </main>
  );
}

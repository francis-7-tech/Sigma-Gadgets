import { Landmark, Minus, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { updateCartQuantity } from "@/app/actions/cart";
import { ProductImage } from "@/components/product-image";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatNaira } from "@/lib/money";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const user = await requireUser("/cart");
  const cart = await getCart(user.id);

  if (cart.lines.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-start gap-4 px-5 py-16">
        <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold tracking-tight">Your cart is empty</h1>
        <p className="text-muted-foreground">Find something you like and add it here.</p>
        <Link
          href="/products"
          className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground hover:bg-primary-hover"
        >
          Start shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-18 pt-7">
      <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold tracking-tight">Your cart</h1>
      <p className="text-muted-foreground">
        {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
      </p>

      <div className="mt-6 flex flex-wrap items-start gap-7">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-3">
          {cart.lines.map((line) => (
            <article key={line.productId} className="flex flex-wrap items-start gap-4 rounded-card border border-border bg-card p-4">
              <Link
                href={`/products/${line.slug}`}
                className="relative size-24 shrink-0 overflow-hidden rounded-control border border-border bg-white"
                tabIndex={-1}
              >
                <ProductImage publicId={line.images[0]} categorySlug={line.categorySlug} alt={line.name} sizes="96px" />
              </Link>
              <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1">
                <span className="text-[13px] font-semibold text-muted-foreground">{line.categoryName}</span>
                <Link href={`/products/${line.slug}`} className="font-semibold leading-snug hover:underline">
                  {line.name}
                </Link>
                <span className="text-sm text-muted-foreground">{formatNaira(line.priceKobo)} each</span>
                {line.exceedsStock ? (
                  <p role="alert" className="text-sm font-semibold text-[#874600]">
                    {line.stock === 0 ? "Sold out. Please remove it to check out." : `Only ${line.stock} left. Please reduce the quantity.`}
                  </p>
                ) : null}
                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  <div role="group" aria-label={`Quantity of ${line.name}`} className="inline-flex items-center rounded-full border border-input bg-card">
                    <form action={updateCartQuantity}>
                      <input type="hidden" name="productId" value={line.productId} />
                      <input type="hidden" name="quantity" value={line.quantity - 1} />
                      <button type="submit" aria-label="Decrease quantity" className="flex size-11 items-center justify-center rounded-full">
                        <Minus className="size-4" aria-hidden="true" />
                      </button>
                    </form>
                    <span className="min-w-8 text-center font-bold tabular-nums">{line.quantity}</span>
                    <form action={updateCartQuantity}>
                      <input type="hidden" name="productId" value={line.productId} />
                      <input type="hidden" name="quantity" value={line.quantity + 1} />
                      <button
                        type="submit"
                        aria-label="Increase quantity"
                        disabled={line.quantity >= line.stock}
                        className="flex size-11 items-center justify-center rounded-full disabled:opacity-40"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                  <form action={updateCartQuantity}>
                    <input type="hidden" name="productId" value={line.productId} />
                    <input type="hidden" name="quantity" value={0} />
                    <button type="submit" className="inline-flex min-h-11 items-center gap-1.5 px-1 font-bold underline underline-offset-4">
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove
                    </button>
                  </form>
                </div>
              </div>
              <span className="ml-auto text-lg font-bold tabular-nums">{formatNaira(line.lineTotalKobo)}</span>
            </article>
          ))}
          <Link href="/products" className="min-h-11 content-center self-start font-bold underline underline-offset-4">
            Continue shopping
          </Link>
        </div>

        <aside aria-label="Order summary" className="flex flex-[1_1_300px] flex-col gap-3.5 rounded-card border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold">Order summary</h2>
          <SummaryRow label="Subtotal" value={formatNaira(cart.subtotalKobo)} />
          <SummaryRow label="Delivery" value={formatNaira(cart.deliveryFeeKobo)} />
          <hr className="border-border" />
          <div className="flex items-baseline justify-between text-lg">
            <strong>Total</strong>
            <span className="text-2xl font-bold tabular-nums">{formatNaira(cart.totalKobo)}</span>
          </div>
          {cart.hasStockProblem ? (
            <span className="flex min-h-12 items-center justify-center rounded-full bg-muted px-5 text-center text-sm font-bold text-muted-foreground">
              Fix the items marked above to check out
            </span>
          ) : (
            <Link
              href="/checkout"
              className="flex min-h-12 items-center justify-center rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary-hover"
            >
              Checkout
            </Link>
          )}
          <p className="flex gap-2 text-sm text-muted-foreground">
            <Landmark className="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
            You&apos;ll pay by bank transfer after placing your order.
          </p>
        </aside>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[15px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

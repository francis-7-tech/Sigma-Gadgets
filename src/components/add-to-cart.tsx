"use client";

import { Minus, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";
import { addToCart, type AddToCartState } from "@/app/actions/cart";

type AddToCartProps = {
  productId: number;
  stock: number;
  withQuantity?: boolean;
};

export function AddToCart({ productId, stock, withQuantity }: AddToCartProps) {
  const pathname = usePathname();
  const [state, action, pending] = useActionState<AddToCartState, FormData>(addToCart, null);
  const [quantity, setQuantity] = useState(1);
  const outOfStock = stock < 1;
  const max = Math.min(Math.max(stock, 1), 20);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="returnTo" value={pathname} />

      <div className="flex flex-wrap items-center gap-3">
        {withQuantity && !outOfStock ? (
          <div role="group" aria-label="Quantity" className="inline-flex items-center rounded-full border border-input bg-card">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex size-11 items-center justify-center rounded-full disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="min-w-8 text-center font-bold tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= max}
              onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              className="flex size-11 items-center justify-center rounded-full disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={outOfStock || pending}
          className={`flex min-h-11 flex-1 items-center justify-center rounded-full px-5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed ${
            outOfStock
              ? "border border-border bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-70"
          } ${withQuantity ? "min-h-12 text-base" : ""}`}
        >
          {outOfStock ? "Out of stock" : pending ? "Adding…" : "Add to cart"}
        </button>
      </div>

      <p aria-live="polite" className={`min-h-5 text-sm ${state?.ok ? "text-[#1D6B3A]" : "text-[#874600]"}`}>
        {state?.message}
      </p>
    </form>
  );
}

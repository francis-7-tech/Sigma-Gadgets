import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-image";
import type { ProductSummary } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";

export function ProductCard({ product, eager }: { product: ProductSummary; eager?: boolean }) {
  const href = `/products/${product.slug}`;
  const badge = product.stock < 1 ? "Out of stock" : product.stock <= 3 ? `Only ${product.stock} left` : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-border bg-card">
      <Link href={href} className="relative block aspect-square border-b border-border bg-white" tabIndex={-1}>
        <ProductImage
          publicId={product.images[0]}
          categorySlug={product.categorySlug}
          alt={product.name}
          sizes="(min-width: 1024px) 280px, 45vw"
          eager={eager}
        />
        {badge ? (
          <span className="absolute left-2.5 top-2.5 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-bold text-[#874600]">
            {badge}
          </span>
        ) : null}
        {product.illustrativePhoto ? (
          <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Illustrative photo
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3.5 sm:p-4">
        <span className="text-[13px] font-semibold text-muted-foreground">{product.categoryName}</span>
        <Link href={href} className="font-semibold leading-snug hover:underline">
          {product.name}
        </Link>
        <span className="mt-auto pt-1 text-lg font-bold tabular-nums">{formatNaira(product.priceKobo)}</span>
        <div className="mt-1.5">
          <AddToCart productId={product.id} stock={product.stock} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, eagerCount = 0 }: { products: ProductSummary[]; eagerCount?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,44%),1fr))] gap-3 sm:gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} eager={i < eagerCount} />
      ))}
    </div>
  );
}

import { Clock, Landmark, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product-gallery";
import { getProductBySlug } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";
import { deliveryFeeKobo } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return product ? { title: product.name, description: product.description } : { title: "Product not found" };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const inStock = product.stock > 0;

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-18 pt-7">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-3">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/products?category=${product.categorySlug}`} className="underline underline-offset-3">
          {product.categoryName}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="mt-4 flex flex-wrap gap-10">
        <div className="min-w-0 flex-[1_1_420px]">
          <ProductGallery images={product.images} categorySlug={product.categorySlug} name={product.name} />
          {product.illustrativePhoto ? (
            <p className="mt-2.5 text-sm text-muted-foreground">
              Illustrative photo: the actual {product.name.split(",")[0]} may look different.
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4.5">
          <span className="text-[13px] font-semibold text-muted-foreground">{product.categoryName}</span>
          <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight tracking-tight">
            {product.name}
          </h1>
          <p className="text-3xl font-bold tabular-nums">{formatNaira(product.priceKobo)}</p>
          <p className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${inStock ? "bg-[#1D8A4A]" : "bg-muted-foreground"}`}
            />
            <strong>{inStock ? "In stock" : "Out of stock"}</strong>
            {inStock ? (
              <span className="text-sm text-muted-foreground">
                {product.stock <= 3 ? `Only ${product.stock} left` : `${product.stock} available`}
              </span>
            ) : null}
          </p>
          <p className="text-muted-foreground">{product.description}</p>

          <AddToCart productId={product.id} stock={product.stock} withQuantity />

          <div className="flex flex-col gap-3 rounded-card bg-muted p-4.5 text-sm">
            <p className="flex items-start gap-3">
              <Landmark className="size-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Pay by bank transfer</strong> after you place your order.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Clock className="size-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Held for 48 hours</strong> while you complete payment.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Truck className="size-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Flat {formatNaira(deliveryFeeKobo)} delivery</strong> on every order.
              </span>
            </p>
          </div>
        </div>
      </div>

      {product.specs.length ? (
        <section className="mt-14 max-w-[640px]">
          <h2 className="font-heading text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold tracking-tight">Key specs</h2>
          <dl className="mt-3">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4 border-b border-border py-3">
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-right font-semibold">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </main>
  );
}

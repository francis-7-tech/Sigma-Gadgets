import { Headphones, Laptop, Smartphone, Watch, BatteryCharging, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { ProductGrid } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { getCategoriesWithCounts, getFeaturedProducts } from "@/lib/catalog";
import { cloudName } from "@/lib/cloudinary";
import { CATEGORY_IMAGES, HERO_IMAGE } from "@/lib/site-images";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  phones: Smartphone,
  laptops: Laptop,
  audio: Headphones,
  wearables: Watch,
  accessories: BatteryCharging,
};

const STEPS = [
  {
    title: "Sign in and add to cart",
    body: "Use your Google account. Your cart is saved, so you can finish on any device.",
  },
  {
    title: "Place your order",
    body: "We reserve your items for 48 hours and email you the payment details.",
  },
  {
    title: "Pay by bank transfer",
    body: "Use your order number as the reference. We confirm and ship once it lands.",
  },
];

export default async function Home() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategoriesWithCounts()]);

  return (
    <main className="flex-1 pb-18">
      <section className="mx-auto w-full max-w-[1200px] px-5 pt-6">
        <div className="flex flex-wrap gap-8 rounded-[28px] bg-muted p-6 sm:p-12 lg:p-16">
          <div className="flex min-w-0 flex-[1_1_380px] flex-col justify-center gap-5">
            <p className="text-sm font-bold">Phones · Laptops · Audio · Wearables</p>
            <h1 className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-balance">
              The gadgets you want, delivered to your door.
            </h1>
            <p className="max-w-[44ch] text-lg text-[#3F4651]">
              Order in minutes, pay by bank transfer, and we ship as soon as your payment lands.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products?category=phones"
                className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground hover:bg-primary-hover"
              >
                Shop phones
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center rounded-full border border-input bg-card px-6 font-bold hover:bg-background"
              >
                Browse everything
              </Link>
            </div>
          </div>
          {cloudName ? (
            <div className="relative aspect-[3/2] min-w-0 flex-[1_1_300px] self-center overflow-hidden rounded-card bg-white">
              <CloudinaryImage
                publicId={HERO_IMAGE.publicId}
                alt={HERO_IMAGE.alt}
                aspect="3:2"
                sizes="(min-width: 1024px) 540px, 100vw"
                eager
              />
            </div>
          ) : (
            <div className="grid min-w-0 flex-[1_1_300px] grid-cols-2 gap-3.5">
              {[
                { slug: "phones", label: "Phones", big: true },
                { slug: "audio", label: "Audio" },
                { slug: "wearables", label: "Wearables" },
              ].map((tile) => (
                <Link
                  key={tile.slug}
                  href={`/products?category=${tile.slug}`}
                  className={`relative flex min-h-[150px] flex-col justify-end overflow-hidden rounded-card bg-white p-4 shadow-[0_6px_20px_rgba(17,19,23,0.06)] ${tile.big ? "row-span-2" : ""}`}
                >
                  <ProductImage categorySlug={tile.slug} alt="" sizes="200px" eager />
                  <span className="relative font-bold">{tile.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 pt-14">
        <h2 className="font-heading text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold tracking-tight">
          How ordering works
        </h2>
        <ol className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5 rounded-card border border-border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted font-bold">{i + 1}</span>
              <h3 className="font-heading text-lg font-bold">{step.title}</h3>
              <p className="text-[15px] text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 pt-14">
        <h2 className="font-heading text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold tracking-tight">
          Shop by category
        </h2>
        <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(180px,44%),1fr))] gap-3">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Smartphone;
            const photo = cloudName ? CATEGORY_IMAGES[category.slug] : undefined;
            return (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="flex flex-col items-start gap-2 rounded-card border border-border bg-card p-4.5 hover:border-input"
              >
                {photo ? (
                  <span className="relative mb-1 block aspect-square w-full overflow-hidden rounded-control bg-white">
                    <CloudinaryImage publicId={photo} alt="" aspect="1:1" sizes="(min-width: 1024px) 220px, 45vw" />
                  </span>
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-control bg-muted">
                    <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                )}
                <span className="font-bold">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  {category.count} {category.count === 1 ? "product" : "products"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold tracking-tight">
            Featured gadgets
          </h2>
          <Link href="/products" className="min-h-11 content-center font-bold underline underline-offset-4">
            See all products
          </Link>
        </div>
        <div className="mt-5">
          <ProductGrid products={featured} />
        </div>
      </section>
    </main>
  );
}

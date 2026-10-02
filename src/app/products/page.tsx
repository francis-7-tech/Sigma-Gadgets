import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { ProductGrid } from "@/components/product-card";
import { getCategoriesWithCounts, searchProducts, type ProductSort } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const params = await searchParams;
  const pick = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
  const query = pick(params.q).slice(0, 100);
  const category = pick(params.category);
  const sort = (SORTS.find((s) => s.value === pick(params.sort))?.value ?? "newest") as ProductSort;

  const categories = await getCategoriesWithCounts();
  const activeCategory = categories.find((c) => c.slug === category);
  const results = await searchProducts({ category: activeCategory?.slug, query, sort });
  const total = categories.reduce((n, c) => n + c.count, 0);

  const hrefFor = (slug?: string) => {
    const next = new URLSearchParams();
    if (slug) next.set("category", slug);
    if (query) next.set("q", query);
    if (sort !== "newest") next.set("sort", sort);
    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const title = activeCategory?.name ?? "All products";

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-18 pt-7">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-3">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span>{title}</span>
      </nav>

      <div className="mt-2.5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {results.length} {results.length === 1 ? "product" : "products"}
            {query ? ` matching “${query}”` : ""}
          </p>
        </div>
        <form action="/products" className="flex flex-[1_1_320px] flex-wrap justify-end gap-2.5">
          {activeCategory ? <input type="hidden" name="category" value={activeCategory.slug} /> : null}
          <label className="relative block flex-[1_1_220px] sm:max-w-[360px]">
            <span className="sr-only">Search gadgets</span>
            <Search className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search gadgets"
              className="min-h-12 w-full rounded-control border border-input bg-card pl-11 pr-3.5"
            />
          </label>
          <label className="block flex-[0_1_210px]">
            <span className="sr-only">Sort by</span>
            <AutoSubmitSelect name="sort" defaultValue={sort} options={SORTS} />
          </label>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-7">
        <aside aria-label="Filter by category" className="flex flex-[1_1_220px] flex-col gap-2.5 lg:max-w-[240px]">
          <span className="text-[13px] font-semibold text-muted-foreground">Category</span>
          <div className="flex flex-wrap gap-2">
            {[{ name: "All products", slug: undefined, count: total }, ...categories].map((c) => {
              const active = (c.slug ?? "") === (activeCategory?.slug ?? "");
              return (
                <Link
                  key={c.slug ?? "all"}
                  href={hrefFor(c.slug)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 flex-[1_1_140px] items-center justify-between gap-2 rounded-control border px-3.5 text-sm font-semibold ${
                    active ? "border-2 border-primary bg-muted" : "border-border bg-card hover:border-input"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="tabular-nums text-muted-foreground">{c.count}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-[999_1_560px]">
          {results.length ? (
            <ProductGrid products={results} eagerCount={4} />
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-card border border-border bg-card p-8">
              <p className="font-semibold">No gadgets match your search.</p>
              <Link href="/products" className="font-bold underline underline-offset-4">
                See all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

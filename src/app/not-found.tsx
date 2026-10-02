import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-start gap-4 px-5 py-16">
      <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">We couldn&apos;t find what you were looking for.</p>
      <Link
        href="/products"
        className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground hover:bg-primary-hover"
      >
        Browse products
      </Link>
    </main>
  );
}

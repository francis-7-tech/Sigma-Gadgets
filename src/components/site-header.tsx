import { Search, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryNav } from "@/components/category-nav";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";
import { getCategoriesWithCounts } from "@/lib/catalog";

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}

export async function SiteHeader() {
  const session = await getSession();
  const userId = session?.user?.id;
  const [cartCount, categories] = await Promise.all([
    userId ? getCartCount(userId) : Promise.resolve(0),
    getCategoriesWithCounts(),
  ]);

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-17 w-full max-w-[1200px] items-center justify-between gap-2 px-5">
        <Link href="/" aria-label="Sigma Gadgets home" className="min-h-11 min-w-0 content-center">
          <Logo />
        </Link>
        <div className="flex shrink-0 items-center sm:gap-1">
          <Link
            href="/products"
            aria-label="Search products"
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted"
          >
            <Search className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            className="relative flex size-11 items-center justify-center rounded-full hover:bg-muted"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="absolute right-0.5 top-1 min-w-[18px] rounded-full bg-primary px-1.5 text-center text-[11px] font-bold leading-[18px] text-primary-foreground">
                {cartCount}
              </span>
            ) : null}
          </Link>
          {session?.user ? (
            <Link
              href="/orders"
              aria-label="Your account and orders"
              className="flex size-11 items-center justify-center rounded-full hover:bg-muted"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initials(session.user.name, session.user.email)}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Sign in"
              className="flex size-11 items-center justify-center rounded-full hover:bg-muted sm:ml-1 sm:size-auto sm:min-h-11 sm:whitespace-nowrap sm:bg-primary sm:px-5 sm:text-sm sm:font-bold sm:text-primary-foreground sm:hover:bg-primary-hover"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground sm:hidden">
                <UserRound className="size-5" aria-hidden="true" />
              </span>
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
      <nav aria-label="Shop sections" className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1200px] items-center gap-1 overflow-x-auto px-5 py-1.5">
          <Suspense fallback={null}>
            <CategoryNav categories={categories} />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}

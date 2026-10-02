import Link from "next/link";
import { Logo } from "@/components/logo";
import { shopWhatsApp, shopWhatsAppUrl } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-7">
        <div className="flex flex-col gap-1.5">
          <Logo />
          {shopWhatsApp ? (
            <p className="text-sm text-muted-foreground">
              Questions? WhatsApp us on{" "}
              <a href={shopWhatsAppUrl} className="font-semibold text-foreground underline underline-offset-4">
                {shopWhatsApp}
              </a>
            </p>
          ) : null}
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-1">
          <Link href="/products" className="flex min-h-11 items-center px-3 font-semibold hover:underline">
            Shop
          </Link>
          <Link href="/orders" className="flex min-h-11 items-center px-3 font-semibold hover:underline">
            My orders
          </Link>
          <Link href="/credits" className="flex min-h-11 items-center px-3 font-semibold hover:underline">
            Photo credits
          </Link>
          <Link href="/privacy" className="flex min-h-11 items-center px-3 font-semibold hover:underline">
            Privacy
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Sigma Gadgets</p>
      </div>
    </footer>
  );
}

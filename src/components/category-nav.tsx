"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type CategoryNavProps = { categories: { name: string; slug: string }[] };

export function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const active =
    pathname === "/products" ? (params.get("category") ?? "all") : pathname.startsWith("/orders") ? "orders" : null;

  const links = [
    { key: "all", label: "All products", href: "/products" },
    ...categories.map((c) => ({ key: c.slug, label: c.name, href: `/products?category=${c.slug}` })),
  ];

  return (
    <>
      {links.map((link) => (
        <NavLink key={link.key} href={link.href} active={active === link.key}>
          {link.label}
        </NavLink>
      ))}
      <span className="ml-auto" />
      <NavLink href="/orders" active={active === "orders"}>
        My orders
      </NavLink>
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

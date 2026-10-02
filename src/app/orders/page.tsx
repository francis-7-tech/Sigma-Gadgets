import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { requireUser, signOut } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { getOrdersForUser } from "@/lib/orders";
import { formatDate } from "@/lib/site";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await getOrdersForUser(user.id);

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-18 pt-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold tracking-tight">My orders</h1>
          <p className="text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="min-h-11 rounded-full border border-input bg-card px-5 font-semibold hover:bg-muted">
            Sign out
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-card border border-border bg-card p-8">
          <p className="font-semibold">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="font-bold underline underline-offset-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-card border border-border bg-card px-5 py-4.5 hover:border-input"
              >
                <span className="flex min-w-0 flex-[1_1_200px] flex-col">
                  <span className="text-[17px] font-bold">{order.orderNumber}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </span>
                </span>
                <StatusBadge status={order.status} />
                <span className="min-w-[110px] text-right text-[17px] font-bold tabular-nums">
                  {formatNaira(order.totalKobo)}
                </span>
                <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

import { Check, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { getOrderForUser, type OrderStatus } from "@/lib/orders";
import { bankDetails, formatDate, formatDateTime } from "@/lib/site";

export const metadata: Metadata = { title: "Your order" };

const PROGRESS: { status: OrderStatus; title: string }[] = [
  { status: "pending", title: "Order placed" },
  { status: "confirmed", title: "Payment received and confirmed" },
  { status: "shipped", title: "Shipped" },
  { status: "delivered", title: "Delivered" },
];

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/orders/${id}`);
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  const awaitingPayment = order.status === "pending";
  const windowPassed = awaitingPayment && order.expiresAt < new Date();
  const reached = PROGRESS.findIndex((p) => p.status === order.status);

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-18 pt-8">
      <div className="flex flex-wrap items-start gap-4">
        {awaitingPayment ? (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#DCF5E4] text-[#1D6B3A]">
            <Check className="size-7" strokeWidth={2.4} aria-hidden="true" />
          </span>
        ) : null}
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-2">
          <p className="text-[13px] font-semibold text-muted-foreground">
            Order {order.orderNumber} · {formatDate(order.createdAt)}
          </p>
          <h1 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-tight tracking-tight">
            {awaitingPayment ? "Order placed. Now complete your payment." : `Order ${order.orderNumber}`}
          </h1>
          <div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-start gap-6">
        {awaitingPayment ? (
          <section aria-label="Payment details" className="min-w-0 flex-[999_1_520px] rounded-card bg-muted p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold tracking-tight">
                Pay by bank transfer
              </h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF1DC] px-3.5 py-2 text-sm font-bold text-[#874600]">
                <Clock className="size-4" aria-hidden="true" />
                {windowPassed ? "Payment window has passed" : `Pay by ${formatDateTime(order.expiresAt)}`}
              </span>
            </div>
            <div className="mt-5 flex flex-col">
              <span className="text-[13px] font-semibold text-muted-foreground">Amount to transfer</span>
              <span className="text-[clamp(2rem,5vw,2.75rem)] font-bold leading-tight tabular-nums">
                {formatNaira(order.totalKobo)}
              </span>
            </div>
            <dl className="mt-5">
              <PayRow label="Bank" value={bankDetails.bankName} />
              <PayRow label="Account name" value={bankDetails.accountName} />
              <PayRow label="Account number" value={bankDetails.accountNumber} copy />
              <PayRow label="Reference / narration" value={order.orderNumber} copy highlight />
            </dl>
            <p className="mt-4 text-[15px] text-muted-foreground">
              We&apos;ll confirm your order as soon as the transfer arrives. If we don&apos;t receive it by{" "}
              {formatDateTime(order.expiresAt)}, the order is cancelled and the items go back on sale. We&apos;ve
              also emailed these details to you.
            </p>
          </section>
        ) : null}

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          {order.status !== "cancelled" ? (
            <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-6">
              <h2 className="font-heading text-xl font-bold">Order status</h2>
              <ol className="flex flex-col gap-4">
                {PROGRESS.map((step, i) => {
                  const done = i <= reached;
                  const current = i === reached + 1;
                  return (
                    <li key={step.status} className="flex items-start gap-3.5">
                      <span
                        className={`flex size-7.5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                          done
                            ? "bg-primary text-primary-foreground"
                            : current
                              ? "border-2 border-primary bg-card"
                              : "border border-input bg-card text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                      </span>
                      <span className={`pt-1 text-[15px] font-bold ${done || current ? "" : "text-muted-foreground"}`}>
                        {step.title}
                        {current && awaitingPayment ? (
                          <span className="block text-sm font-normal text-muted-foreground">Waiting for your transfer</span>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}
          <section className="flex flex-col gap-1.5 rounded-card border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold">Delivering to</h2>
            <span className="font-semibold">{order.shippingName}</span>
            <span className="text-muted-foreground">
              {order.shippingAddress}, {order.shippingCity}, {order.shippingState}
            </span>
            <span className="text-muted-foreground">{order.shippingPhone}</span>
          </section>
        </div>
      </div>

      <section className="mt-6 flex flex-col gap-3.5 rounded-card border border-border bg-card p-6">
        <h2 className="font-heading text-xl font-bold">Items</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-baseline justify-between gap-3">
            <span>
              <span className="font-semibold">{item.productName}</span>
              <span className="text-sm text-muted-foreground"> × {item.quantity}</span>
            </span>
            <span className="font-semibold tabular-nums">{formatNaira(item.unitPriceKobo * item.quantity)}</span>
          </div>
        ))}
        <hr className="border-border" />
        <div className="flex justify-between text-[15px]">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{formatNaira(order.subtotalKobo)}</span>
        </div>
        <div className="flex justify-between text-[15px]">
          <span className="text-muted-foreground">Delivery</span>
          <span className="tabular-nums">{formatNaira(order.deliveryFeeKobo)}</span>
        </div>
        <div className="flex items-baseline justify-between text-lg">
          <strong>Total</strong>
          <span className="text-xl font-bold tabular-nums">{formatNaira(order.totalKobo)}</span>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/orders" className="inline-flex min-h-12 items-center rounded-full border border-input bg-card px-6 font-bold hover:bg-muted">
          View my orders
        </Link>
        <Link href="/products" className="inline-flex min-h-12 items-center px-2 font-bold underline underline-offset-4">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}

function PayRow({ label, value, copy, highlight }: { label: string; value: string; copy?: boolean; highlight?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-input py-3.5">
      <dt className="text-[15px] text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap items-center gap-2.5 font-bold">
        <span
          className={
            highlight
              ? "rounded-control border border-input bg-card px-3 py-1 text-xl font-extrabold tabular-nums"
              : "tabular-nums"
          }
        >
          {value || "Not set"}
        </span>
        {copy && value ? <CopyButton value={value} label={label.toLowerCase()} /> : null}
      </dd>
    </div>
  );
}

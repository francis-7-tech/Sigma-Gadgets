"use client";

import { cloneElement, useActionState, type ReactNode } from "react";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import { NIGERIAN_STATES } from "@/lib/nigeria";

type CheckoutFormProps = {
  user: { name: string; email: string; image: string | null };
  summary: ReactNode;
};

export function CheckoutForm({ user, summary }: CheckoutFormProps) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, null);
  const values = state?.values ?? {};
  const errors = state?.errors ?? {};

  return (
    <form action={action} noValidate className="mt-6 flex flex-wrap items-start gap-7">
      <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
        <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold">1. Contact</h2>
          <p>
            <strong>{user.name || user.email}</strong>
            <br />
            <span className="text-sm text-muted-foreground">{user.email} · signed in with Google</span>
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold">2. Delivery details</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4">
            <Field label="Full name" name="name" error={errors.name}>
              <input name="name" autoComplete="name" defaultValue={values.name ?? user.name} required />
            </Field>
            <Field label="Phone number" name="phone" error={errors.phone}>
              <input name="phone" type="tel" autoComplete="tel" defaultValue={values.phone} placeholder="0803 000 0000" required />
            </Field>
            <Field label="Street address" name="address" error={errors.address} wide>
              <input name="address" autoComplete="street-address" defaultValue={values.address} required />
            </Field>
            <Field label="City or area" name="city" error={errors.city}>
              <input name="city" autoComplete="address-level2" defaultValue={values.city} required />
            </Field>
            <Field label="State" name="state" error={errors.state}>
              <select name="state" autoComplete="address-level1" defaultValue={values.state ?? "Lagos"} required>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold">3. Payment</h2>
          <div className="flex gap-3.5 rounded-control border-2 border-primary bg-muted p-4">
            <span aria-hidden="true" className="mt-1 size-4 shrink-0 rounded-full border-[5px] border-primary bg-white" />
            <span className="flex flex-col gap-1">
              <strong>Bank transfer</strong>
              <span className="text-sm text-muted-foreground">
                After you place your order we&apos;ll show and email our bank details. Use your order number as
                the transfer reference. Your items are held for 48 hours.
              </span>
            </span>
          </div>
        </section>
      </div>

      <aside aria-label="Order summary" className="flex flex-[1_1_300px] flex-col gap-3.5 rounded-card border border-border bg-card p-6">
        <h2 className="font-heading text-xl font-bold">Your order</h2>
        {summary}
        {state?.message ? (
          <p role="alert" className="rounded-control bg-[#FFF1DC] px-4 py-3 text-sm font-semibold text-[#874600]">
            {state.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-12 items-center justify-center rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-70"
        >
          {pending ? "Placing order…" : "Place order"}
        </button>
        <p className="text-sm text-muted-foreground">Your items are reserved for 48 hours while you complete payment.</p>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  wide,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  wide?: boolean;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLElement>>;
}) {
  const errorId = `${name}-error`;
  const control = cloneElement(children, {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: `min-h-12 rounded-control border bg-card px-3.5 ${error ? "border-[#B42318]" : "border-input"}`,
  });
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "col-span-full" : ""}`}>
      <span className="text-sm font-semibold">{label}</span>
      {control}
      {error ? (
        <span id={errorId} className="text-sm font-semibold text-[#B42318]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

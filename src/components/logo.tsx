export function Logo() {
  return (
    <span className="inline-flex max-w-full items-center gap-2 sm:gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary font-heading text-xl font-extrabold text-primary-foreground"
      >
        Σ
      </span>
      <span className="truncate font-heading text-lg font-extrabold tracking-tight sm:text-xl">Sigma Gadgets</span>
    </span>
  );
}

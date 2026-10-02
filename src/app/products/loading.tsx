export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading" className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-18 pt-7">
      <div className="h-10 w-64 max-w-full animate-pulse rounded-control bg-muted" />
      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(240px,44%),1fr))] gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-border bg-card">
            <div className="aspect-square animate-pulse bg-muted" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

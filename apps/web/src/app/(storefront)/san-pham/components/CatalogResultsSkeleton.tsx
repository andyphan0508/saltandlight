const GRID_COLS: Record<string, string> = {
  "2": "grid-cols-2",
  "3": "grid-cols-2 sm:grid-cols-3",
  "4": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

export function CatalogResultsSkeleton({ view = "3" }: { view?: string }) {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between border-b border-ink/10 pb-5">
        <div className="h-9 w-40 rounded-full bg-ink/5" />
        <div className="h-9 w-44 rounded-full bg-ink/5" />
      </div>
      <div className={`mt-6 grid gap-4 sm:gap-6 ${GRID_COLS[view] ?? GRID_COLS["3"]}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] rounded-3xl bg-ink/5" />
            <div className="mt-3.5 h-3.5 w-3/4 rounded bg-ink/10" />
            <div className="mt-2 h-3.5 w-1/2 rounded bg-ink/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

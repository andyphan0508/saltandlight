export function CatalogSidebarSkeleton() {
  return (
    <div className="w-full animate-pulse lg:w-64 lg:flex-shrink-0">
      <div className="h-11 rounded-2xl bg-ink/5" />
      <div className="mt-4 space-y-3 rounded-2xl border border-ink/10 bg-white p-4">
        <div className="h-4 w-32 rounded bg-ink/10" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3.5 w-full rounded bg-ink/5" />
        ))}
      </div>
      <div className="mt-4 space-y-3 rounded-2xl border border-ink/10 bg-white p-4">
        <div className="h-4 w-24 rounded bg-ink/10" />
        <div className="flex flex-wrap gap-2 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-14 rounded-full bg-ink/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

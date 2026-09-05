export function CatalogSidebarSkeleton() {
  return (
    <>
      {/* Mobile Skeleton */}
      <div className="block lg:hidden w-full space-y-3 mb-2 animate-pulse">
        <div className="flex gap-2 overflow-x-hidden py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-24 flex-shrink-0 rounded-full bg-ink/5" />
          ))}
        </div>
        <div className="flex justify-between items-center pt-1">
          <div className="h-8 w-36 rounded-2xl bg-ink/5" />
          <div className="h-5 w-20 rounded bg-ink/5" />
        </div>
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden lg:block w-64 flex-shrink-0 animate-pulse space-y-4">
        <div className="h-11 rounded-2xl bg-ink/5" />
        <div className="space-y-3 rounded-2xl border border-ink/10 bg-white p-4">
          <div className="h-4 w-32 rounded bg-ink/10" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3.5 w-full rounded bg-ink/5" />
          ))}
        </div>
        <div className="space-y-3 rounded-2xl border border-ink/10 bg-white p-4">
          <div className="h-4 w-24 rounded bg-ink/10" />
          <div className="flex flex-wrap gap-2 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 w-12 rounded-full bg-ink/5" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

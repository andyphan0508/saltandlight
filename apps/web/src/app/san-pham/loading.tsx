export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-40 sm:h-48 w-full rounded-3xl bg-mint-100/80" />

      {/* Filter bar Skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-24 rounded-full bg-ink/10" />
        <div className="h-8 w-32 rounded-full bg-ink/10" />
        <div className="h-8 w-28 rounded-full bg-ink/10" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white p-3.5 shadow-card border border-ink/5 space-y-3"
          >
            <div className="aspect-[4/5] w-full rounded-2xl bg-mint-100/60" />
            <div className="h-4 w-3/4 rounded-full bg-ink/10" />
            <div className="h-3 w-1/2 rounded-full bg-ink/10" />
            <div className="h-4 w-1/3 rounded-full bg-mint-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-2xl bg-ink/10" />
        <div className="h-10 w-32 rounded-full bg-mint-200/80" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-3"
          >
            <div className="h-4 w-24 rounded-full bg-ink/10" />
            <div className="h-8 w-32 rounded-full bg-mint-200" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-4">
        <div className="h-6 w-40 rounded-full bg-ink/10" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full rounded-2xl bg-cream-100/80" />
          ))}
        </div>
      </div>
    </div>
  );
}

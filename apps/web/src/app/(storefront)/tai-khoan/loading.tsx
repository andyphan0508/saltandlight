export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8 animate-pulse">
      {/* Profile Card Skeleton */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-mint-100 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-mint-200" />
            <div className="h-6 w-48 rounded-xl bg-ink/10" />
            <div className="h-3 w-36 rounded-full bg-ink/5" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-2xl bg-ink/5" />
          <div className="h-9 w-24 rounded-2xl bg-ink/5" />
        </div>
      </div>

      {/* Orders Header Skeleton */}
      <div className="border-b border-ink/10 pb-3 flex items-center justify-between">
        <div className="h-6 w-44 rounded-xl bg-ink/10" />
        <div className="h-4 w-28 rounded-full bg-ink/5" />
      </div>

      {/* Orders List Skeleton */}
      <div className="space-y-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white p-5 sm:p-6 shadow-card border border-ink/5 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-ink/5 pb-4">
              <div className="space-y-1">
                <div className="h-5 w-32 rounded-xl bg-ink/10" />
                <div className="h-3 w-24 rounded-full bg-ink/5" />
              </div>
              <div className="h-6 w-28 rounded-full bg-mint-100" />
            </div>
            <div className="space-y-2">
              <div className="h-12 w-full rounded-2xl bg-cream-50" />
              <div className="h-12 w-full rounded-2xl bg-cream-50" />
            </div>
            <div className="flex justify-between items-center border-t border-ink/5 pt-4">
              <div className="h-5 w-40 rounded-xl bg-ink/10" />
              <div className="h-8 w-28 rounded-xl bg-ink/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

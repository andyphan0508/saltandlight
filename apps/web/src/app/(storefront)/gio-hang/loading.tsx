export default function CartLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8 animate-pulse">
      {/* Title */}
      <div className="border-b border-ink/10 pb-4">
        <div className="h-8 w-56 rounded-2xl bg-ink/10" />
      </div>

      {/* Free ship notification skeleton */}
      <div className="h-16 w-full rounded-3xl bg-mint-100/70 border border-mint-200/50" />

      {/* Main Cart Content */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Cart Item List Skeleton */}
        <div className="space-y-4 lg:col-span-7">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-3xl bg-white p-4 sm:p-5 shadow-card border border-ink/5 items-center"
            >
              <div className="h-24 w-20 flex-shrink-0 rounded-2xl bg-mint-100/60" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-3/4 rounded-full bg-ink/10" />
                <div className="h-3 w-1/2 rounded-full bg-ink/10" />
                <div className="h-4 w-1/4 rounded-full bg-mint-200" />
              </div>
              <div className="h-5 w-20 rounded-full bg-ink/10 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Order Summary Box Skeleton */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-5 space-y-5">
          <div className="h-6 w-44 rounded-full bg-ink/10" />
          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <div className="h-4 w-28 rounded-full bg-ink/10" />
              <div className="h-4 w-20 rounded-full bg-ink/10" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-24 rounded-full bg-ink/10" />
              <div className="h-4 w-16 rounded-full bg-ink/10" />
            </div>
          </div>
          <div className="border-t border-ink/10 pt-4 flex justify-between">
            <div className="h-6 w-32 rounded-full bg-ink/10" />
            <div className="h-6 w-24 rounded-full bg-ink/10" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-brand-forest/20" />
        </div>
      </div>
    </div>
  );
}

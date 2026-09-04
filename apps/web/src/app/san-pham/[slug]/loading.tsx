export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-16 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-16 rounded-full bg-ink/10" />
        <span className="text-ink/20">/</span>
        <div className="h-3 w-20 rounded-full bg-ink/10" />
        <span className="text-ink/20">/</span>
        <div className="h-3 w-32 rounded-full bg-mint-200" />
      </div>

      {/* Main Product Layout Skeleton */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] w-full rounded-3xl bg-mint-100/60 border border-ink/5" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 w-20 flex-shrink-0 rounded-2xl bg-mint-100/40 border border-ink/5"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Buy Box Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-full bg-mint-200" />
            <div className="h-8 w-4/5 rounded-2xl bg-ink/15" />
            <div className="h-4 w-3/5 rounded-xl bg-ink/10" />
          </div>

          {/* Price Box Skeleton */}
          <div className="rounded-2xl bg-white p-5 border border-ink/5 space-y-2 shadow-sm">
            <div className="flex items-baseline gap-3">
              <div className="h-8 w-36 rounded-xl bg-mint-300/80" />
              <div className="h-5 w-24 rounded-lg bg-ink/10" />
            </div>
            <div className="h-3.5 w-48 rounded-md bg-mint-100" />
          </div>

          {/* Options Skeleton (Color / Size) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 w-20 rounded-md bg-ink/10" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-20 rounded-xl bg-cream-100 border border-ink/10" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-16 rounded-md bg-ink/10" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-9 w-12 rounded-xl bg-cream-100 border border-ink/10" />
                ))}
              </div>
            </div>
          </div>

          {/* Add to Cart Button Skeleton */}
          <div className="space-y-3 pt-4">
            <div className="h-14 w-full rounded-2xl bg-brand-forest/30" />
            <div className="h-12 w-full rounded-2xl bg-mint-200/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

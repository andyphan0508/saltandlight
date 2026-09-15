/** Placeholder while the session and orders load. */
export const AccountSkeleton = () => (
  <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 space-y-8 animate-pulse">
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-mint-100" />
      <div className="space-y-2 flex-1">
        <div className="h-6 w-48 rounded-xl bg-ink/10" />
        <div className="h-4 w-32 rounded-xl bg-ink/5" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-8 w-44 rounded-2xl bg-ink/10" />
      <OrderCardsSkeleton />
    </div>
  </div>
);

export const OrderCardsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2].map((i) => (
      <div key={i} className="h-44 rounded-3xl bg-white p-6 shadow-card border border-ink/5" />
    ))}
  </div>
);

export default function CustomOrderLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center space-y-3">
        <div className="mx-auto h-14 w-14 rounded-full bg-mint-100" />
        <div className="mx-auto h-4 w-48 rounded-full bg-mint-200" />
        <div className="mx-auto h-8 w-72 sm:w-96 rounded-2xl bg-ink/10" />
        <div className="mx-auto h-4 max-w-lg rounded-full bg-ink/5" />
      </div>

      {/* 4 Steps Skeleton */}
      <div className="rounded-3xl bg-mint-50 p-8 sm:p-10 border border-mint-200 space-y-6">
        <div className="mx-auto h-6 w-56 rounded-full bg-ink/10" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="rounded-2xl bg-white p-5 shadow-sm border border-ink/5 space-y-2">
              <div className="h-6 w-8 rounded-full bg-mint-200" />
              <div className="h-4 w-28 rounded-full bg-ink/10" />
              <div className="h-3 w-full rounded-full bg-ink/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Form Container Skeleton */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-4">
            <div className="h-5 w-40 rounded-full bg-ink/10" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-full rounded-full bg-ink/5" />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-7 space-y-4">
          <div className="h-6 w-48 rounded-full bg-ink/10 mb-6" />
          <div className="h-10 w-full rounded-2xl bg-ink/5" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 w-full rounded-2xl bg-ink/5" />
            <div className="h-10 w-full rounded-2xl bg-ink/5" />
          </div>
          <div className="h-28 w-full rounded-2xl bg-ink/5" />
          <div className="h-12 w-full rounded-2xl bg-brand-forest/20" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSubLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 sm:w-64 rounded-xl bg-slate-200" />
          <div className="h-4 w-72 sm:w-96 rounded-lg bg-slate-100" />
        </div>
        <div className="h-9 w-32 rounded-full bg-slate-200" />
      </div>

      {/* Top Metric Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded-md bg-slate-200" />
              <div className="h-9 w-9 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 w-36 rounded-lg bg-slate-200" />
            <div className="h-3 w-24 rounded-md bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Main Table / Data Card Skeleton */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="h-5 w-40 rounded-lg bg-slate-200" />
          <div className="h-8 w-48 rounded-full bg-slate-100" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-44 rounded-md bg-slate-200" />
                  <div className="h-3 w-28 rounded-md bg-slate-100" />
                </div>
              </div>
              <div className="h-6 w-20 rounded-full bg-slate-100" />
              <div className="h-4 w-24 rounded-md bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:py-16 animate-pulse">
      <div className="text-center space-y-3">
        <div className="mx-auto h-16 w-16 rounded-full bg-mint-100" />
        <div className="mx-auto h-4 w-36 rounded-full bg-mint-200" />
        <div className="mx-auto h-8 w-64 rounded-2xl bg-ink/10" />
        <div className="mx-auto h-4 max-w-sm rounded-full bg-ink/5" />
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 space-y-6">
        <div className="space-y-3">
          <div className="h-12 w-full rounded-2xl bg-ink/5" />
          <div className="h-12 w-full rounded-2xl bg-[#1877F2]/20" />
        </div>

        <div className="border-t border-ink/10 pt-5 space-y-2.5">
          <div className="h-4 w-3/4 rounded-full bg-ink/5" />
          <div className="h-4 w-5/6 rounded-full bg-ink/5" />
          <div className="h-4 w-2/3 rounded-full bg-ink/5" />
        </div>
      </div>
    </div>
  );
}

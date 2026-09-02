import { formatVND } from "@saltandlight/domain";

export function RevenueChart({ series }: { series: { date: string; total: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.total));

  return (
    <div className="flex h-40 items-end gap-1.5">
      {series.map((s) => {
        const heightPct = Math.max(3, Math.round((s.total / max) * 100));
        const label = new Date(s.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        return (
          <div key={s.date} className="group relative flex flex-1 flex-col items-center gap-2">
            <div className="pointer-events-none absolute -top-9 z-10 hidden whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
              {formatVND(s.total)}
            </div>
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-md bg-mint-300 transition-colors group-hover:bg-brand-forest"
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-[9px] font-medium text-ink/35">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

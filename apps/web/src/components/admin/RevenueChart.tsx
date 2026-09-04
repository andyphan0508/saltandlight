import { formatVND } from "@saltandlight/domain";

export function RevenueChart({ series }: { series: { date: string; total: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.total));
  const totalRevenue = series.reduce((sum, s) => sum + s.total, 0);
  const avgDaily = Math.round(totalRevenue / Math.max(1, series.length));

  return (
    <div className="space-y-5">
      {/* Mini Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Tổng 14 ngày qua
          </span>
          <span className="text-lg font-black text-brand-forest">
            {formatVND(totalRevenue)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Trung bình ngày
          </span>
          <span className="text-xs font-bold text-slate-600">
            {formatVND(avgDaily)}/ngày
          </span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="flex h-44 items-end gap-2 pt-4">
        {series.map((s) => {
          const heightPct = Math.max(4, Math.round((s.total / max) * 100));
          const label = new Date(s.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });

          return (
            <div
              key={s.date}
              className="group relative flex flex-1 flex-col items-center gap-2"
            >
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-10 z-20 hidden whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-[11px] font-bold text-white shadow-lg group-hover:block transition-all">
                <p className="text-[10px] text-mint-200">{label}</p>
                <p>{formatVND(s.total)}</p>
              </div>

              {/* Bar Container */}
              <div className="flex h-32 w-full items-end rounded-t-lg bg-slate-50 overflow-hidden">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-forest via-emerald-600 to-teal-400 transition-all duration-300 group-hover:brightness-110 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Date Label */}
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-ink transition-colors">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

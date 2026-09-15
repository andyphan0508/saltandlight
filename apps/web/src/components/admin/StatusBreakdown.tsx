import { ADMIN_ORDER_STATUS as STATUS_META } from "@/lib/order-status-styles";

const STATUS_ORDER = Object.keys(STATUS_META);

export function StatusBreakdown({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-3.5">
      {STATUS_ORDER.map((key) => {
        const meta = STATUS_META[key]!;
        const count = counts[key] ?? 0;
        const pct = Math.round((count / total) * 100);

        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${meta.barClass}`} />
                <span className="font-semibold text-slate-700">{meta.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">{count}</span>
                <span className="text-[11px] font-bold text-slate-400">({pct}%)</span>
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${meta.barClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

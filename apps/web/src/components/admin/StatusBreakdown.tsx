const STATUS_META: Record<
  string,
  { label: string; barClass: string; textClass: string; bgClass: string }
> = {
  pending_payment: {
    label: "Chờ thanh toán",
    barClass: "bg-amber-500",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
  },
  processing: {
    label: "Đang xử lý",
    barClass: "bg-sky-500",
    textClass: "text-sky-700",
    bgClass: "bg-sky-50",
  },
  on_hold: {
    label: "Tạm giữ",
    barClass: "bg-slate-400",
    textClass: "text-slate-700",
    bgClass: "bg-slate-100",
  },
  completed: {
    label: "Hoàn tất",
    barClass: "bg-emerald-500",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
  },
  cancelled: {
    label: "Đã hủy",
    barClass: "bg-slate-300",
    textClass: "text-slate-500",
    bgClass: "bg-slate-100",
  },
  refunded: {
    label: "Đã hoàn tiền",
    barClass: "bg-rose-500",
    textClass: "text-rose-700",
    bgClass: "bg-rose-50",
  },
};

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
                <span className="font-black text-ink">{count}</span>
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

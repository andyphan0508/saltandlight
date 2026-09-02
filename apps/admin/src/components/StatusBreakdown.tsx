const STATUS_META: Record<string, { label: string; barClass: string }> = {
  pending_payment: { label: "Chờ thanh toán", barClass: "bg-gold-500" },
  processing: { label: "Đang xử lý", barClass: "bg-brand-accent" },
  on_hold: { label: "Tạm giữ", barClass: "bg-ink/40" },
  completed: { label: "Hoàn tất", barClass: "bg-brand-forest" },
  cancelled: { label: "Đã hủy", barClass: "bg-ink/20" },
  refunded: { label: "Đã hoàn tiền", barClass: "bg-sale" },
};
const STATUS_ORDER = Object.keys(STATUS_META);

export function StatusBreakdown({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-3">
      {STATUS_ORDER.map((key) => {
        const meta = STATUS_META[key]!;
        const count = counts[key] ?? 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-ink/70">{meta.label}</span>
              <span className="font-bold text-ink">{count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/5">
              <div className={`h-full rounded-full ${meta.barClass}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

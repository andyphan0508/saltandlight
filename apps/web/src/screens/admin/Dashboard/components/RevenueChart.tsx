import { formatVND } from "@saltandlight/domain";
import { formatDayMonth } from "@/helpers/day-month";

// Brand green, lightened until it reads as green rather than near-black on white
// (dataviz palette check: lightness band, chroma floor and 3:1 contrast all pass).
const BAR = "#1f7a55";

/** "1,2tr" / "850k": short enough to sit on a column cap. */
const compactVnd = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`
    : value >= 1_000
      ? `${Math.round(value / 1_000)}k`
      : String(value);

const dayLabel = (date: string) => formatDayMonth(new Date(date));

/**
 * Daily revenue columns. Only the best day is labelled; every column shows its value
 * on hover, keyboard focus or a tap (focus is what a tap gives on touch screens), and
 * the same numbers are in the table below.
 */
export const RevenueChart = ({ series }: { series: { date: string; total: number }[] }) => {
  const max = Math.max(1, ...series.map((s) => s.total));
  const peakIndex = series.findIndex((s) => s.total === max);
  const totalRevenue = series.reduce((sum, s) => sum + s.total, 0);
  const avgDaily = Math.round(totalRevenue / Math.max(1, series.length));
  const last = series.length - 1;

  return (
    <div className="space-y-5">
      {/* Mini Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Tổng 14 ngày qua
          </span>
          <span className="text-lg font-bold text-brand-forest">
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

      <div className="relative pt-6" role="group" aria-label="Doanh thu theo ngày, 14 ngày gần nhất">
        <div className="flex h-40 items-end gap-[2px] border-b border-[#c3c2b7]">
          {series.map((s, i) => {
            const label = dayLabel(s.date);
            // Keep the tooltip inside the card at both edges
            const tipPosition = i < 3 ? "left-0" : i > last - 3 ? "right-0" : "left-1/2 -translate-x-1/2";
            return (
              <div
                key={s.date}
                tabIndex={0}
                aria-label={`${label}: ${formatVND(s.total)}`}
                className="group relative flex h-full flex-1 cursor-default items-end justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40"
              >
                {i === peakIndex && s.total > 0 && (
                  <span
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tabular-nums text-slate-600"
                    style={{ bottom: `calc(${(s.total / max) * 100}% + 4px)` }}
                  >
                    {compactVnd(s.total)}
                  </span>
                )}
                <div
                  className="w-full max-w-6 rounded-t-[4px] transition-opacity group-hover:opacity-80 group-focus:opacity-80"
                  style={{ height: s.total > 0 ? `max(${(s.total / max) * 100}%, 3px)` : "0", backgroundColor: BAR }}
                />
                <div
                  className={`pointer-events-none absolute bottom-full z-20 mb-1 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg group-hover:block group-focus:block ${tipPosition}`}
                >
                  <p className="font-bold tabular-nums">{formatVND(s.total)}</p>
                  <p className="text-slate-300">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Labels hang centred under their column without widening it; phones fit every other date */}
        <div className="mt-1.5 flex h-4 gap-[2px]" aria-hidden="true">
          {series.map((s, i) => (
            <span key={s.date} className="relative min-w-0 flex-1">
              <span
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] tabular-nums text-slate-400 ${(last - i) % 2 ? "max-sm:hidden" : ""}`}
              >
                {dayLabel(s.date)}
              </span>
            </span>
          ))}
        </div>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer py-1 font-semibold text-slate-500 hover:text-slate-800">Xem dạng bảng</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-slate-500">
            <tr>
              <th className="py-1 font-semibold">Ngày</th>
              <th className="py-1 text-right font-semibold">Doanh thu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {series.map((s) => (
              <tr key={s.date}>
                <td className="py-1.5">{dayLabel(s.date)}</td>
                <td className="py-1.5 text-right">{formatVND(s.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};

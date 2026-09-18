import { formatInt } from "../format";

export interface TimeBucket {
  label: string;
  /** Short axis label; empty to skip a tick. */
  tick: string;
  paid: number;
  other: number;
}

const PAID = "#2a78d6";
const OTHER = "#eb6834";

/**
 * Stacked columns: paid-ad sessions at the base, everything else above, with a
 * 2px surface gap between segments. Every column has a hover tooltip, and the
 * same numbers are available as a table.
 */
export const TrafficTimeChart = ({ buckets, caption }: { buckets: TimeBucket[]; caption: string }) => {
  const max = Math.max(1, ...buckets.map((b) => b.paid + b.other));
  const niceMax = max <= 5 ? 5 : Math.ceil(max / 5) * 5;
  const ticks = [niceMax, niceMax / 2, 0];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PAID }} aria-hidden="true" />
          Từ quảng cáo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: OTHER }} aria-hidden="true" />
          Nguồn khác
        </span>
      </div>

      <div className="flex gap-2" role="group" aria-label={caption}>
        <div className="flex h-44 flex-col justify-between pb-5 text-right text-[10px] tabular-nums text-[#898781]">
          {ticks.map((t) => (
            <span key={t}>{formatInt(t)}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((t) => (
              <div key={t} className={`h-px ${t === 0 ? "bg-[#c3c2b7]" : "bg-[#e1e0d9]"}`} />
            ))}
          </div>
          <div className="relative flex h-44 items-end gap-[2px]">
            {buckets.map((b, i) => {
              const total = b.paid + b.other;
              // Keep the tooltip inside the card at both edges
              const tipPosition =
                i < 3 ? "left-0" : i > buckets.length - 4 ? "right-0" : "left-1/2 -translate-x-1/2";
              return (
                // Focusable so a tap (touch screens have no hover) or the keyboard shows the tooltip
                <div
                  key={b.label}
                  tabIndex={0}
                  aria-label={`${b.label}: ${formatInt(total)} phiên, quảng cáo ${formatInt(b.paid)}, khác ${formatInt(b.other)}`}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <div className="flex w-full max-w-6 flex-col justify-end gap-[2px] pb-5" style={{ height: "100%" }}>
                    {b.other > 0 && (
                      <div
                        className={`w-full ${b.paid > 0 ? "" : "rounded-b-none"} rounded-t-[4px]`}
                        style={{ height: `${(b.other / niceMax) * 100}%`, backgroundColor: OTHER, maxHeight: "100%" }}
                      />
                    )}
                    {b.paid > 0 && (
                      <div
                        className={`w-full ${b.other > 0 ? "" : "rounded-t-[4px]"}`}
                        style={{ height: `${(b.paid / niceMax) * 100}%`, backgroundColor: PAID }}
                      />
                    )}
                  </div>
                  <span className="absolute bottom-0 text-[10px] tabular-nums text-[#898781]">{b.tick}</span>
                  {/* Hover / tap target is the whole column band, not just the bar */}
                  <div className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden w-max rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg group-hover:block group-focus:block ${tipPosition}`}>
                    <div className="font-bold">{b.label}</div>
                    <div>Tổng: {formatInt(total)} phiên</div>
                    <div>Quảng cáo: {formatInt(b.paid)} · Khác: {formatInt(b.other)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800">Xem dạng bảng</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-slate-500">
            <tr>
              <th className="py-1 font-semibold">Thời gian</th>
              <th className="py-1 text-right font-semibold">Quảng cáo</th>
              <th className="py-1 text-right font-semibold">Khác</th>
              <th className="py-1 text-right font-semibold">Tổng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {buckets
              .filter((b) => b.paid + b.other > 0)
              .map((b) => (
                <tr key={b.label}>
                  <td className="py-1">{b.label}</td>
                  <td className="py-1 text-right">{formatInt(b.paid)}</td>
                  <td className="py-1 text-right">{formatInt(b.other)}</td>
                  <td className="py-1 text-right font-semibold">{formatInt(b.paid + b.other)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};

"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { ProductActivityPoint } from "@/helpers/analytics/product-activity";
import { formatInt } from "../format";

// Categorical slots 1–3 in fixed order, validated together (CVD ΔE 9.2, normal 27.6). The aqua
// is under 3:1 on white, which is why there's a legend, a tooltip and a table view.
const SERIES = [
  { key: "views", label: "Lượt xem sản phẩm", color: "#2a78d6" },
  { key: "carts", label: "Thêm vào giỏ", color: "#eb6834" },
  { key: "wishlists", label: "Yêu thích", color: "#1baf7a" },
] as const;

const W = 1000;
const H = 200;
const MAX_TICKS = 6;

/** Rounds the top of the axis up to a clean number so the gridlines read 0 / 5 / 10. */
const niceCeil = (value: number) => {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / (step / 2)) * (step / 2);
};

/**
 * Product interactions over time: three lines on one count axis. A crosshair snaps to
 * the nearest time bucket (mouse, touch drag or arrow keys) and lists all three values.
 */
export const ProductActivityChart = ({ points }: { points: ProductActivityPoint[] }) => {
  const [active, setActive] = useState<number | null>(null);
  const n = points.length;
  const max = niceCeil(Math.max(0, ...points.flatMap((p) => SERIES.map((s) => p[s.key]))));
  const totals = SERIES.map((s) => points.reduce((sum, p) => sum + p[s.key], 0));

  if (n === 0 || totals.every((t) => t === 0)) {
    return <p className="py-8 text-center text-xs text-slate-400">Chưa có lượt xem, thêm giỏ hay yêu thích nào trong khoảng thời gian này.</p>;
  }

  const xPct = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const yPct = (v: number) => 100 - (v / max) * 100;
  const tickEvery = Math.max(1, Math.ceil(n / MAX_TICKS));
  // Ticks count back from the last bucket so "now" is always labelled
  const showTick = (i: number) => (n - 1 - i) % tickEvery === 0;

  const indexAt = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.min(n - 1, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * (n - 1))));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const from = active ?? n - 1;
    setActive(Math.min(n - 1, Math.max(0, from + (e.key === "ArrowRight" ? 1 : -1))));
  };

  const point = active === null ? null : points[active]!;
  // Anchored at the crosshair; near an edge it opens inward so it never leaves the card
  const tipShift = active === null ? "" : xPct(active) < 25 ? "" : xPct(active) > 75 ? "-translate-x-full" : "-translate-x-1/2";

  return (
    <div>
      {/* Legend doubles as the totals for the range */}
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {SERIES.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
            {s.label}
            <span className="font-semibold tabular-nums text-slate-900">{formatInt(totals[i]!)}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <div className="flex h-48 flex-col justify-between pb-5 text-right text-[10px] tabular-nums text-[#898781]" aria-hidden="true">
          {[max, max / 2, 0].map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {formatInt(t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            role="img"
            tabIndex={0}
            aria-label={`Biểu đồ đường: ${SERIES.map((s, i) => `${s.label} ${formatInt(totals[i]!)}`).join(", ")}. Dùng phím mũi tên để xem từng mốc.`}
            onPointerMove={(e) => setActive(indexAt(e))}
            onPointerDown={(e) => setActive(indexAt(e))}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
            className="relative h-48 touch-pan-y pb-5 outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <div className="relative h-full">
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                {[0, 0.5, 1].map((f) => (
                  <line
                    key={f}
                    x1="0"
                    x2={W}
                    y1={H * f}
                    y2={H * f}
                    stroke={f === 1 ? "#c3c2b7" : "#e1e0d9"}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {SERIES.map((s) => (
                  <polyline
                    key={s.key}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    points={points.map((p, i) => `${(xPct(i) / 100) * W},${(yPct(p[s.key]) / 100) * H}`).join(" ")}
                  />
                ))}
                {active !== null && (
                  <line
                    x1={(xPct(active) / 100) * W}
                    x2={(xPct(active) / 100) * W}
                    y1="0"
                    y2={H}
                    stroke="#898781"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>

              {/* Dots are HTML so they stay round while the SVG stretches */}
              {SERIES.map((s) => {
                const i = active ?? n - 1;
                return (
                  <span
                    key={s.key}
                    aria-hidden="true"
                    className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
                    style={{ left: `${xPct(i)}%`, top: `${yPct(points[i]![s.key])}%`, backgroundColor: s.color }}
                  />
                );
              })}

              {point && (
                <div
                  className={`pointer-events-none absolute -top-2 z-10 w-max -translate-y-full rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-white shadow-lg ${tipShift}`}
                  style={{ left: `${xPct(active!)}%` }}
                >
                  <div className="mb-1 text-slate-300">{point.label}</div>
                  {SERIES.map((s) => (
                    <div key={s.key} className="flex items-center gap-2">
                      <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                      <span className="font-bold tabular-nums">{formatInt(point[s.key])}</span>
                      <span className="text-slate-300">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 h-4" aria-hidden="true">
              {points.map((p, i) =>
                showTick(i) ? (
                  <span
                    key={p.label}
                    className={`absolute whitespace-nowrap text-[10px] tabular-nums text-[#898781] ${
                      i === 0 && n > 1 ? "" : i === n - 1 && n > 1 ? "-translate-x-full" : "-translate-x-1/2"
                    }`}
                    style={{ left: `${xPct(i)}%` }}
                  >
                    {p.tick}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </div>

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer py-1 font-semibold text-slate-500 hover:text-slate-800">Xem dạng bảng</summary>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-left tabular-nums">
            <thead className="text-slate-500">
              <tr>
                <th className="py-1 font-semibold">Thời gian</th>
                {SERIES.map((s) => (
                  <th key={s.key} className="py-1 pl-3 text-right font-semibold">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {points.map((p) => (
                <tr key={p.label}>
                  <td className="py-1">{p.label}</td>
                  {SERIES.map((s) => (
                    <td key={s.key} className="py-1 pl-3 text-right">
                      {formatInt(p[s.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

import { TrendingDown, TrendingUp } from "@/components/admin/Icons";
import { describeChange } from "../format";

interface KpiTileProps {
  label: string;
  value: string;
  current: number;
  previous: number;
  kind: "count" | "rate";
  /** Whether a rise is good news (visitors) or bad news (bounce rate). */
  isHigherBetter?: boolean;
  hint?: string;
  /** The one figure a group leads with: bigger, and two columns wide. */
  isHero?: boolean;
  className?: string;
}

/**
 * A stat tile with its change against the previous period. The change is a pill whose
 * icon, sign and colour agree, so colour never carries it alone. Any explanation opens
 * on tap or keyboard focus as well as hover — a phone has no hover.
 */
export const KpiTile = ({ label, value, current, previous, kind, isHigherBetter = true, hint, isHero = false, className = "" }: KpiTileProps) => {
  const change = describeChange(current, previous, kind);
  const isGood = change.direction === 0 ? null : (change.direction > 0) === isHigherBetter;
  const tone =
    isGood === null ? "bg-slate-100 text-slate-500" : isGood ? "bg-emerald-50 text-[#006300]" : "bg-rose-50 text-[#b42323]";
  const Arrow = change.direction >= 0 ? TrendingUp : TrendingDown;

  return (
    <div
      tabIndex={hint ? 0 : undefined}
      className={`group relative flex flex-col justify-between rounded-[1.25rem] bg-white p-3.5 sm:p-4 shadow-[0_1px_1px_rgba(15,23,42,0.03),0_12px_28px_-20px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/[0.05] outline-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-2 focus-visible:ring-slate-400 ${
        isHero ? "col-span-2 sm:p-6" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium leading-snug text-slate-500">{label}</span>
        {hint && (
          <span aria-hidden="true" className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
            ?
          </span>
        )}
      </div>

      <div className={`mt-2 font-semibold tracking-tight text-slate-900 ${isHero ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl"}`}>{value}</div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold tabular-nums ${tone}`}>
          {change.direction !== 0 && <Arrow size={12} aria-hidden="true" />}
          {change.direction === 0 ? "Không đổi" : change.text}
          <span className="sr-only">{isGood === null ? "" : isGood ? " (tốt lên)" : " (xấu đi)"}</span>
        </span>
        {/* The revenue tile says it once; on a phone the small tiles keep it for screen readers only */}
        <span className={`text-slate-400 ${isHero ? "" : "max-sm:sr-only"}`}>so với kỳ trước</span>
      </div>

      {hint && (
        <p
          role="tooltip"
          className="pointer-events-none absolute inset-x-2 top-full z-10 mt-1.5 translate-y-1 rounded-xl bg-slate-900 px-3 py-2 text-[11px] leading-relaxed text-white opacity-0 shadow-lg transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100"
        >
          {hint}
        </p>
      )}
    </div>
  );
};

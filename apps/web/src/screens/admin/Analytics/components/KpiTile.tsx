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
}

/** A stat tile with its change against the previous period — arrow, text and colour agree, never colour alone. */
export const KpiTile = ({ label, value, current, previous, kind, isHigherBetter = true, hint }: KpiTileProps) => {
  const change = describeChange(current, previous, kind);
  const isGood = change.direction === 0 ? null : (change.direction > 0) === isHigherBetter;
  const tone = isGood === null ? "text-slate-500" : isGood ? "text-[#006300]" : "text-[#d03b3b]";
  const arrow = change.direction > 0 ? "▲" : change.direction < 0 ? "▼" : "•";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4" title={hint}>
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-400">so với kỳ trước</span>
        <span className={`font-semibold ${tone}`}>
          <span aria-hidden="true">{arrow}</span> {change.text}
          <span className="sr-only">{isGood === null ? " không đổi" : isGood ? " (tốt lên)" : " (xấu đi)"}</span>
        </span>
      </div>
    </div>
  );
};

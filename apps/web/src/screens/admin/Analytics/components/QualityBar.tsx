import { QUALITY_LABELS, type SessionQuality } from "@/helpers/analytics/sessions";
import { AlertTriangle, ArrowRight, CheckCircle, Shield } from "@/components/admin/Icons";
import { formatInt, formatPercent } from "../format";

// Status steps for "bad → fine"; the ordinary bounce is a neutral, not a status.
// Colours never stand alone: every segment is also listed with its label and share.
const SEGMENTS: { key: SessionQuality; color: string; Icon: typeof Shield }[] = [
  { key: "suspect", color: "#d03b3b", Icon: Shield },
  { key: "instant_exit", color: "#ec835a", Icon: AlertTriangle },
  { key: "bounce", color: "#898781", Icon: ArrowRight },
  { key: "engaged", color: "#0ca30c", Icon: CheckCircle },
];

/** Share of sessions by how real they look, as one stacked bar plus a labelled breakdown. */
export const QualityBar = ({ quality }: { quality: Record<SessionQuality, number> }) => {
  const total = SEGMENTS.reduce((sum, s) => sum + quality[s.key], 0);
  if (total === 0) return <p className="text-xs text-slate-400">Chưa có phiên truy cập nào trong khoảng này.</p>;

  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label="Chất lượng phiên truy cập">
        {SEGMENTS.filter((s) => quality[s.key] > 0).map((s) => (
          <div key={s.key} style={{ width: `${(quality[s.key] / total) * 100}%`, backgroundColor: s.color }} title={`${QUALITY_LABELS[s.key]}: ${formatPercent(quality[s.key] / total)}`} />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-900/[0.03]">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden="true" />
              <s.Icon size={12} className="flex-shrink-0 text-slate-500" aria-hidden="true" />
              {QUALITY_LABELS[s.key]}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {formatPercent(quality[s.key] / total)} <span className="text-[11px] font-medium text-slate-400">· {formatInt(quality[s.key])} phiên</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

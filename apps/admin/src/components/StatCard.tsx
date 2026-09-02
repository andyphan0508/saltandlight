import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "./Icons";

type Tone = "ink" | "forest" | "gold" | "sale" | "blue" | "purple";

const toneClasses: Record<Tone, { bg: string; text: string; border: string }> = {
  forest: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  blue: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100" },
  gold: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
  sale: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  ink: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

export function StatCard({
  label,
  value,
  icon,
  tone = "ink",
  trend,
  suffix,
  subtext,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: Tone;
  trend?: { value: string; positive: boolean };
  suffix?: string;
  subtext?: string;
}) {
  const t = toneClasses[tone];

  return (
    <div className="luno-card p-5.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && (
          <span
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-xl border shadow-xs transition-transform duration-200",
              t.bg,
              t.text,
              t.border,
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
          {value}
        </span>
        {suffix && <span className="text-xs font-semibold text-slate-400">{suffix}</span>}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        {trend ? (
          <div
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border",
              trend.positive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                : "bg-rose-50 text-rose-700 border-rose-200/80",
            )}
          >
            {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend.value}</span>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">
            {subtext || "Toàn thời gian"}
          </span>
        )}
      </div>
    </div>
  );
}

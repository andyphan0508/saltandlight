import { clsx } from "clsx";

type Tone = "ink" | "forest" | "gold" | "sale";

const toneClasses: Record<Tone, { bg: string; text: string }> = {
  ink: { bg: "bg-ink/5", text: "text-ink" },
  forest: { bg: "bg-mint-100", text: "text-brand-forest" },
  gold: { bg: "bg-gold-100", text: "text-gold-600" },
  sale: { bg: "bg-sale-light", text: "text-sale" },
};

export function StatCard({
  label,
  value,
  icon,
  tone = "ink",
  trend,
  suffix,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: Tone;
  trend?: { value: string; positive: boolean };
  suffix?: string;
}) {
  const t = toneClasses[tone];
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</span>
        {icon && (
          <span className={clsx("flex h-9 w-9 items-center justify-center rounded-xl", t.bg, t.text)}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-black tracking-tight text-ink">{value}</span>
        {suffix && <span className="text-xs font-medium text-ink/40">{suffix}</span>}
      </div>
      {trend && (
        <div
          className={clsx(
            "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
            trend.positive ? "text-emerald-600" : "text-sale",
          )}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </div>
      )}
    </div>
  );
}

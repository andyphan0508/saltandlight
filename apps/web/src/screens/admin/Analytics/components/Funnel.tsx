import { formatInt, formatPercent } from "../format";

export interface FunnelStep {
  label: string;
  value: number;
}

/** Single-series funnel: bar length is the count, and the drop between steps is spelled out in text. */
export const Funnel = ({ steps }: { steps: FunnelStep[] }) => {
  const top = Math.max(1, steps[0]?.value ?? 0);
  return (
    <ol className="space-y-2.5">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1]!.value : null;
        const kept = prev ? step.value / prev : null;
        return (
          <li key={step.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700">{step.label}</span>
              <span className="tabular-nums text-slate-900">
                <strong>{formatInt(step.value)}</strong>
                {kept !== null && (
                  <span className="ml-2 text-[11px] text-slate-500">
                    giữ {formatPercent(kept)} · rơi <span className="font-semibold text-[#d03b3b]">{formatPercent(1 - kept)}</span>
                  </span>
                )}
              </span>
            </div>
            <div className="h-5 w-full rounded-r-[4px] bg-slate-100">
              <div className="h-5 rounded-r-[4px] bg-[#2a78d6]" style={{ width: `${Math.max((step.value / top) * 100, step.value > 0 ? 1 : 0)}%` }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
};

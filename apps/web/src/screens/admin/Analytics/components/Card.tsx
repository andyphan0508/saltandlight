import type { ReactNode } from "react";

/**
 * Dashboard panel as a tray and a plate: a faint outer shell with a hairline, and the
 * white content core inside it with a concentric, slightly smaller radius. Depth comes
 * from that nesting and one wide, soft shadow tinted to the ink, not a grey drop shadow.
 */
export const Card = ({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) => (
  <section className="analytics-rise rounded-[1.75rem] bg-slate-900/[0.025] p-1.5 ring-1 ring-slate-900/[0.05]">
    <div className="h-full rounded-[calc(1.75rem-0.375rem)] bg-white p-4 shadow-[0_1px_1px_rgba(15,23,42,0.03),0_18px_40px_-24px_rgba(15,23,42,0.14)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 max-w-[65ch] text-xs leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  </section>
);

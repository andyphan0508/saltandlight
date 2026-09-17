import type { ReactNode } from "react";

/** White dashboard card with a title, an optional one-line explanation and optional right-hand action. */
export const Card = ({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) => (
  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

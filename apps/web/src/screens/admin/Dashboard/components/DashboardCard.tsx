import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle: string;
  /** Right side of the header: a badge or a "see all" link. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Dashboard panel with the shared uppercase title / subtitle header. */
export const DashboardCard = ({ title, subtitle, aside, className = "", children }: DashboardCardProps) => (
  <div className={`luno-card p-6 sm:p-8 rounded-3xl ${className}`}>
    <div className="flex items-center justify-between border-b border-slate-100 pb-4.5">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      {aside}
    </div>
    <div className="mt-5">{children}</div>
  </div>
);

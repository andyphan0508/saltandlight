import { Calendar } from "./Icons";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Calendar size={13} className="text-slate-400" />
            <span>{subtitle}</span>
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5">{action}</div>}
    </div>
  );
}

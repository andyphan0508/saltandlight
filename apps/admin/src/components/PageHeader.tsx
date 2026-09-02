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
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-black uppercase text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink/55">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

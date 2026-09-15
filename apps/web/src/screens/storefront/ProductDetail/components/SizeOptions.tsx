interface SizeOptionsProps {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
  /** Shows the "Bảng size" link when the category has size charts. */
  onOpenSizeChart?: () => void;
}

/** Size buttons (sorted small → large upstream) with an optional size-chart link. */
export const SizeOptions = ({ sizes, value, onChange, onOpenSizeChart }: SizeOptionsProps) => (
  <div className="w-full min-w-0">
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <span className="text-xs font-bold uppercase tracking-wider text-ink/70 flex-shrink-0">
        Kích thước: <strong className="text-ink">{value}</strong>
      </span>
      {onOpenSizeChart && (
        <button
          type="button"
          onClick={onOpenSizeChart}
          className="text-xs font-bold text-brand-forest underline hover:text-ink transition-colors flex-shrink-0 flex items-center gap-1 active-press"
        >
          <span>📏 Bảng size</span>
        </button>
      )}
    </div>
    <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
      {sizes.map((size) => {
        const isActive = size === value;
        return (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            aria-pressed={isActive}
            className={`flex h-10 sm:h-11 min-w-10 sm:min-w-11 items-center justify-center rounded-xl border px-3 text-xs font-bold transition-all active-press ${
              isActive ? "border-ink bg-ink text-white shadow-sm ring-2 ring-ink/20" : "border-ink/15 bg-white text-ink hover:border-ink/40"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  </div>
);

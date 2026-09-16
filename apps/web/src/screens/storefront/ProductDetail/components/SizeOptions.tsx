interface SizeOptionsProps {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
}

/** Size buttons, sorted small → large upstream. The size chart itself is rendered
 *  further down the page by <ProductGuides>, so there is no popup here. */
export const SizeOptions = ({ sizes, value, onChange }: SizeOptionsProps) => (
  <div className="w-full min-w-0">
    <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
      Kích thước: <strong className="text-ink">{value}</strong>
    </span>
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

interface SizeOptionsProps {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
  isAvailable: (size: string) => boolean;
}

/** Size buttons, sorted small → large upstream. The size chart itself is rendered
 *  further down the page by <ProductGuides>, so there is no popup here. */
export const SizeOptions = ({ sizes, value, onChange, isAvailable }: SizeOptionsProps) => (
  <div className="w-full min-w-0">
    <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
      Kích thước: <strong className="text-ink">{value}</strong>
    </span>
    <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
      {sizes.map((size) => {
        const isActive = size === value;
        const isInStock = isAvailable(size);
        return (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            disabled={!isInStock}
            aria-pressed={isActive}
            aria-label={isInStock ? `Size ${size}` : `Size ${size} — hết hàng`}
            title={isInStock ? undefined : "Hết hàng"}
            className={`flex h-10 sm:h-11 min-w-10 sm:min-w-11 items-center justify-center rounded-xl border px-3 text-xs font-bold transition-all ${
              !isInStock
                ? "cursor-not-allowed border-ink/10 bg-white text-ink opacity-35"
                : isActive
                  ? "border-ink bg-ink text-white shadow-sm ring-2 ring-ink/20 active-press"
                  : "border-ink/15 bg-white text-ink hover:border-ink/40 active-press"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  </div>
);

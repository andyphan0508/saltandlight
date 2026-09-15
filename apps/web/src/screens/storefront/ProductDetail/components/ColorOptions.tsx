interface ColorOptionsProps {
  colors: string[];
  value: string | null;
  onChange: (color: string) => void;
}

const isDarkColor = (color: string) => /đen|black/i.test(color);

/** Color pills with a small swatch (dark for "đen"/"black", light otherwise). */
export const ColorOptions = ({ colors, value, onChange }: ColorOptionsProps) => (
  <div className="w-full min-w-0">
    <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
      Màu sắc: <strong className="text-ink">{value}</strong>
    </span>
    <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
      {colors.map((color) => {
        const isActive = color === value;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-pressed={isActive}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition-all active-press ${
              isActive ? "border-ink bg-ink text-white shadow-sm ring-2 ring-ink/20" : "border-ink/15 bg-white text-ink hover:border-ink/40"
            }`}
          >
            <span
              className={`h-3.5 w-3.5 rounded-full border ${isDarkColor(color) ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-300"}`}
            />
            <span>{color}</span>
          </button>
        );
      })}
    </div>
  </div>
);

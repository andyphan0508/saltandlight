import { isHexColor, textColorOn } from "@/helpers/color";

interface ColorOption {
  name: string;
  hex: string | null;
}

interface ColorOptionsProps {
  colors: ColorOption[];
  value: string | null;
  onChange: (color: string) => void;
}

const isDarkColor = (color: string) => /đen|black/i.test(color);

/** Color pills painted with the admin-picked swatch; colors saved before the picker keep the name-based guess. */
export const ColorOptions = ({ colors, value, onChange }: ColorOptionsProps) => (
  <div className="w-full min-w-0">
    <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
      Màu sắc: <strong className="text-ink">{value}</strong>
    </span>
    <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
      {colors.map(({ name, hex }) => {
        const isActive = name === value;
        const hasSwatch = isHexColor(hex);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-pressed={isActive}
            style={hasSwatch ? { backgroundColor: hex, color: textColorOn(hex) } : undefined}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition-all active-press ${
              isActive ? "border-ink shadow-sm ring-2 ring-ink/25" : "border-ink/15 hover:border-ink/40"
            } ${hasSwatch ? "" : isActive ? "bg-ink text-white" : "bg-white text-ink"}`}
          >
            {!hasSwatch && (
              <span
                className={`h-3.5 w-3.5 rounded-full border ${isDarkColor(name) ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-300"}`}
              />
            )}
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  </div>
);

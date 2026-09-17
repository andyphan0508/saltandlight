import { swatchFor, textColorOn } from "@/helpers/color";

interface ColorOption {
  name: string;
  hex: string | null;
}

interface ColorOptionsProps {
  colors: ColorOption[];
  value: string | null;
  onChange: (color: string) => void;
  isAvailable: (color: string) => boolean;
}

/**
 * Colour pills, each painted with its own colour. Selecting one never changes
 * its background — only a thicker outline marks it, drawn as a ring so the
 * pill doesn't shift when the border thickens.
 */
export const ColorOptions = ({ colors, value, onChange, isAvailable }: ColorOptionsProps) => (
  <div className="w-full min-w-0">
    <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
      Màu sắc: <strong className="text-ink">{value}</strong>
    </span>
    <div className="mt-2.5 flex flex-wrap gap-2.5 sm:gap-3">
      {colors.map(({ name, hex }) => {
        const isActive = name === value;
        const swatch = swatchFor(name, hex);
        const isInStock = isAvailable(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            disabled={!isInStock}
            aria-pressed={isActive}
            aria-label={isInStock ? name : `${name} — hết hàng`}
            title={isInStock ? undefined : "Hết hàng"}
            style={{ backgroundColor: swatch, color: textColorOn(swatch) }}
            className={`rounded-full border border-ink/15 px-4 py-1.5 sm:py-2 text-xs font-bold transition-shadow ${
              isInStock ? "active-press" : "cursor-not-allowed opacity-35"
            } ${isActive ? "ring-2 ring-ink ring-offset-2" : isInStock ? "hover:ring-1 hover:ring-ink/30 hover:ring-offset-1" : ""}`}
          >
            {name}
          </button>
        );
      })}
    </div>
  </div>
);

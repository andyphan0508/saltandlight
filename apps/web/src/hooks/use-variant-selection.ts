import { useEffect, useMemo, useState } from "react";
import { sortSizes } from "@saltandlight/domain";
import { isHexColor } from "@/helpers/color";
import {
  initialSelection,
  isColorAvailable,
  isSizeAvailable,
  isSoldOut,
  sizeForColor,
} from "@/helpers/variant-availability";
import type { ProductVariantOption } from "@/interfaces/catalog";

const uniqueValues = (values: (string | null)[]) => Array.from(new Set(values.filter(Boolean))) as string[];

/** Color and size choices for a product, which of them still have stock, and the variant they pick. */
export const useVariantSelection = (variants: ProductVariantOption[]) => {
  // One entry per color name, keeping the first swatch any of its variants carries
  const colors = useMemo(() => {
    const byName = new Map<string, { name: string; hex: string | null }>();
    for (const variant of variants) {
      if (!variant.color) continue;
      const existing = byName.get(variant.color);
      if (!existing) byName.set(variant.color, { name: variant.color, hex: variant.colorHex });
      else if (!isHexColor(existing.hex) && isHexColor(variant.colorHex)) existing.hex = variant.colorHex;
    }
    return Array.from(byName.values());
  }, [variants]);
  const sizes = useMemo(() => sortSizes(uniqueValues(variants.map((v) => v.size))), [variants]);
  // Open on a combination that can actually be bought
  const [initial] = useState(() => initialSelection(variants, colors.map((c) => c.name), sizes));
  const [color, setColorState] = useState<string | null>(initial.color);
  const [size, setSize] = useState<string | null>(initial.size);

  // Changing colour moves off a size that's sold out in the new colour
  const setColor = (next: string) => {
    setColorState(next);
    setSize((current) => sizeForColor(variants, sizes, next, current));
  };

  // Keep a valid size selected when the size list changes
  useEffect(() => {
    if (sizes.length > 0 && (!size || !sizes.includes(size))) setSize(sizes[0] ?? null);
  }, [sizes, size]);

  const selected =
    variants.find((v) => (color ? v.color === color : true) && (size ? v.size === size : true)) ?? variants[0];

  return {
    colors,
    sizes,
    color,
    size,
    selected,
    setColor,
    setSize,
    isSoldOut: isSoldOut(variants),
    isColorAvailable: (name: string) => isColorAvailable(variants, name),
    isSizeAvailable: (name: string) => isSizeAvailable(variants, name, color),
  };
};

import { useEffect, useMemo, useState } from "react";
import { sortSizes } from "@saltandlight/domain";
import type { ProductVariantOption } from "@/interfaces/catalog";

const uniqueValues = (values: (string | null)[]) => Array.from(new Set(values.filter(Boolean))) as string[];

/** Color and size choices for a product and the variant they pick (the first variant when nothing matches). */
export const useVariantSelection = (variants: ProductVariantOption[]) => {
  const colors = useMemo(() => uniqueValues(variants.map((v) => v.color)), [variants]);
  const sizes = useMemo(() => sortSizes(uniqueValues(variants.map((v) => v.size))), [variants]);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);

  // Keep a valid size selected when the size list changes
  useEffect(() => {
    if (sizes.length > 0 && (!size || !sizes.includes(size))) setSize(sizes[0] ?? null);
  }, [sizes, size]);

  const selected =
    variants.find((v) => (color ? v.color === color : true) && (size ? v.size === size : true)) ?? variants[0];

  return { colors, sizes, color, size, selected, setColor, setSize };
};

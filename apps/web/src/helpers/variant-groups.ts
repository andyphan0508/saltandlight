import type { VariantRow } from "@/interfaces/product-form";

export interface VariantGroup {
  /** Identity of the group — variants are grouped by the color name the admin typed. */
  color: string;
  colorHex: string;
  rows: { index: number; sku: string; size: string; price: number; compareAtPrice: number | null; stockQuantity: number }[];
}

/**
 * Groups the flat variant list by color, keeping each variant's index in that
 * list so edits still address the original row. Order follows first appearance,
 * so the table never reshuffles while the admin is typing.
 */
export const groupVariantsByColor = (variants: VariantRow[]): VariantGroup[] => {
  const groups: VariantGroup[] = [];
  const byColor = new Map<string, VariantGroup>();

  variants.forEach((variant, index) => {
    let group = byColor.get(variant.color);
    if (!group) {
      group = { color: variant.color, colorHex: variant.colorHex, rows: [] };
      byColor.set(variant.color, group);
      groups.push(group);
    }
    // First row of the group that has a swatch decides the group's swatch
    if (!group.colorHex && variant.colorHex) group.colorHex = variant.colorHex;
    group.rows.push({
      index,
      sku: variant.sku,
      size: variant.size,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      stockQuantity: variant.stockQuantity,
    });
  });

  return groups;
};

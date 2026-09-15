import { sortSizes } from "@saltandlight/domain";
import { slugify } from "./slugify";

export interface PricedVariant {
  price: number;
  compareAtPrice: number | null;
}

/** Uppercase SKU segment joined from product, color and size, e.g. "AO-THUN-DEN-M". */
export const skuify = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .map((part) => slugify(part).toUpperCase())
    .join("-");

const splitList = (csv: string) =>
  csv
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/** Every color × size pair from comma-separated inputs, sizes sorted small → large. Empty when both are blank. */
export const buildVariantCombos = (colorsCsv: string, sizesCsv: string) => {
  const colors = splitList(colorsCsv);
  const sizes = sortSizes(splitList(sizesCsv));
  if (colors.length && sizes.length) return colors.flatMap((color) => sizes.map((size) => ({ color, size })));
  if (colors.length) return colors.map((color) => ({ color, size: "" }));
  return sizes.map((size) => ({ color: "", size }));
};

/** Sale price after a discount: percent rounds to the nearest 1.000đ, a fixed amount never goes below 0. */
export const discountedPrice = (base: number, discountType: string, value: number) =>
  discountType === "percent" ? Math.round((base * (1 - value / 100)) / 1000) * 1000 : Math.max(0, base - value);

/** Discounts each variant from its list price (compareAtPrice, or price when it has none). */
export const applyDiscount = <T extends PricedVariant>(variants: T[], discountType: string, value: number): T[] =>
  variants.map((variant) => {
    const base = variant.compareAtPrice ?? variant.price;
    return base ? { ...variant, compareAtPrice: base, price: discountedPrice(base, discountType, value) } : variant;
  });

/** Restores list prices and drops compareAtPrice. */
export const clearDiscount = <T extends PricedVariant>(variants: T[]): T[] =>
  variants.map((variant) =>
    variant.compareAtPrice ? { ...variant, price: variant.compareAtPrice, compareAtPrice: null } : variant,
  );

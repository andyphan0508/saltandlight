/** All prices are stored/transacted as whole VND (no decimals). */
export function formatVND(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export function calcDiscountPercent(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * A product's `minPrice` / `maxCompareAtPrice` columns are a denormalized
 * cache of its active variants, recomputed here on every variant write
 * (admin product save, WooCommerce migration, seed). Keeping it in sync at
 * write time is what lets the storefront filter/sort/paginate the catalog
 * with a plain indexed column instead of joining every product's variants
 * on every listing request.
 */
export function computePriceRange(
  variants: { isActive: boolean; price: number; compareAtPrice?: number | null }[],
): { minPrice: number | null; maxCompareAtPrice: number | null } {
  const active = variants.filter((v) => v.isActive);
  if (active.length === 0) return { minPrice: null, maxCompareAtPrice: null };
  const compareAts = active.map((v) => v.compareAtPrice).filter((v): v is number => v != null);
  return {
    minPrice: Math.min(...active.map((v) => v.price)),
    maxCompareAtPrice: compareAts.length ? Math.max(...compareAts) : null,
  };
}

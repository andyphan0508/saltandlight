interface StockedVariant {
  color: string | null;
  size: string | null;
  stockQuantity: number;
}

const inStock = (variant: StockedVariant) => variant.stockQuantity > 0;

/** True when every variant is gone — the only time the buy buttons turn into "hết hàng". */
export const isSoldOut = (variants: StockedVariant[]) => !variants.some(inStock);

/** A colour stays pickable while any of its sizes has stock. */
export const isColorAvailable = (variants: StockedVariant[], color: string) =>
  variants.some((v) => v.color === color && inStock(v));

/** A size is pickable only in the currently chosen colour (or any, for products without colours). */
export const isSizeAvailable = (variants: StockedVariant[], size: string, color: string | null) =>
  variants.some((v) => v.size === size && (color ? v.color === color : true) && inStock(v));

/**
 * The size to show for a colour: keep the current one if it has stock in that
 * colour, else the smallest size that does (sizes arrive sorted small → large),
 * else leave it — everything in that colour is sold out.
 */
export const sizeForColor = (
  variants: StockedVariant[],
  sizes: string[],
  color: string | null,
  current: string | null,
): string | null => {
  if (current && isSizeAvailable(variants, current, color)) return current;
  return sizes.find((size) => isSizeAvailable(variants, size, color)) ?? current ?? sizes[0] ?? null;
};

/** Opening selection: the first colour with stock, then its smallest size with stock. */
export const initialSelection = (variants: StockedVariant[], colors: string[], sizes: string[]) => {
  const color = colors.find((c) => isColorAvailable(variants, c)) ?? colors[0] ?? null;
  return { color, size: sizeForColor(variants, sizes, color, null) };
};

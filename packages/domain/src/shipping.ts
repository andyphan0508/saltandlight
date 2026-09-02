export interface ShippingMethodLike {
  id: string;
  type: "flat_rate" | "free_shipping";
  fee: number;
  freeThreshold: number | null;
  isActive: boolean;
}

/**
 * Mirrors the single-zone "Toàn quốc" logic from WooCommerce: free shipping
 * wins once the subtotal clears its threshold, otherwise flat rate applies.
 */
export function pickShippingFee(subtotal: number, methods: ShippingMethodLike[]): number {
  const active = methods.filter((m) => m.isActive);
  const free = active.find((m) => m.type === "free_shipping");
  if (free && (free.freeThreshold == null || subtotal >= free.freeThreshold)) {
    return 0;
  }
  const flat = active.find((m) => m.type === "flat_rate");
  return flat ? flat.fee : 0;
}

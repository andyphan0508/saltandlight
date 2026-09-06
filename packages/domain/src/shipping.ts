export interface ShippingMethodLike {
  id: string;
  type: "flat_rate" | "free_shipping";
  fee: number;
  freeThreshold: number | null;
  isActive: boolean;
}

export interface ShippingZoneLike {
  id: string;
  /** Vietnam province codes (from vn-locations.ts) this zone applies to. Empty = nationwide fallback. */
  provinceCodes: number[];
  methods: ShippingMethodLike[];
}

/** Free shipping wins once the subtotal clears its threshold, otherwise the flat rate applies. */
function pickFeeFromMethods(subtotal: number, methods: ShippingMethodLike[]): number {
  const active = methods.filter((m) => m.isActive);
  const free = active.find((m) => m.type === "free_shipping");
  if (free && (free.freeThreshold == null || subtotal >= free.freeThreshold)) {
    return 0;
  }
  const flat = active.find((m) => m.type === "flat_rate");
  return flat ? flat.fee : 0;
}

/**
 * Picks the shipping fee for a given subtotal + destination province.
 * A zone whose `provinceCodes` explicitly includes the customer's province
 * always wins over the nationwide ("Toàn quốc") fallback zone (the one
 * with an empty `provinceCodes`), so an admin-created regional policy
 * overrides the default without needing to touch it.
 */
export function pickShippingFee(
  subtotal: number,
  provinceCode: number | null,
  zones: ShippingZoneLike[],
): number {
  const specific = provinceCode != null ? zones.find((z) => z.provinceCodes.includes(provinceCode)) : undefined;
  const zone = specific ?? zones.find((z) => z.provinceCodes.length === 0);
  if (!zone) return 0;
  return pickFeeFromMethods(subtotal, zone.methods);
}

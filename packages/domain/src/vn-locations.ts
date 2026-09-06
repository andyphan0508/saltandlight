import vnLocationsData from "./data/vn-locations.json";

/**
 * Vietnam's post-2025-reform administrative divisions: 34 provincial units,
 * 2-tier (Province/City → Ward/Commune — the district level was abolished
 * 1/7/2025). Vendored once via `scripts/src/fetch-vn-locations.ts` from
 * provinces.open-api.vn so checkout never depends on a third-party API at
 * runtime — see that script's header comment for how/when to re-run it.
 */

export interface VnWard {
  code: number;
  name: string;
}

export interface VnProvince {
  code: number;
  name: string;
  wards: VnWard[];
}

const PROVINCES: VnProvince[] = vnLocationsData.provinces;

/** All 34 provinces/cities, without their (large) wards arrays — for populating the province dropdown. */
export function getAllProvinces(): { code: number; name: string }[] {
  return PROVINCES.map((p) => ({ code: p.code, name: p.name }));
}

/** Wards for one province, or `[]` if the province code is unknown. */
export function getWardsByProvince(provinceCode: number): VnWard[] {
  return PROVINCES.find((p) => p.code === provinceCode)?.wards ?? [];
}

export function findProvince(provinceCode: number): VnProvince | undefined {
  return PROVINCES.find((p) => p.code === provinceCode);
}

/** True if `wardCode` genuinely belongs to `provinceCode` in the vendored dataset — used to validate checkout submissions server-side. */
export function isValidLocation(provinceCode: number, wardCode: number): boolean {
  const province = findProvince(provinceCode);
  return !!province?.wards.some((w) => w.code === wardCode);
}

/** The full dataset, for the `/api/locations` route to serve to the client as-is. */
export function getAllLocations(): VnProvince[] {
  return PROVINCES;
}

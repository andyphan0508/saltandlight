export interface WardOption {
  provinceCode: number;
  province: string;
  wardCode: number;
  ward: string;
  /** Ward name folded for matching, e.g. "phuong ben thanh". */
  wardKey: string;
  /** Same, without the "Phường / Xã / Đặc khu" prefix, e.g. "ben thanh". */
  coreKey: string;
  provinceKey: string;
}

/** Lower-case, strip Vietnamese diacritics (đ included) so "ben thanh" finds "Bến Thành". */
export const foldVietnamese = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const WARD_PREFIX = /^(phuong|xa|dac khu|thi tran)\s+/;

/** Flattens the province → ward tree once, precomputing the folded keys every keystroke compares against. */
export const buildWardIndex = (
  provinces: { code: number; name: string; wards: { code: number; name: string }[] }[],
): WardOption[] =>
  provinces.flatMap((province) => {
    const provinceKey = foldVietnamese(province.name);
    return province.wards.map((ward) => {
      const wardKey = foldVietnamese(ward.name);
      return {
        provinceCode: province.code,
        province: province.name,
        wardCode: ward.code,
        ward: ward.name,
        wardKey,
        coreKey: wardKey.replace(WARD_PREFIX, ""),
        provinceKey,
      };
    });
  });

/**
 * Every word typed must appear somewhere in "ward + province", so "ben thanh hcm"
 * style queries narrow across both. Ranked so the name the customer is typing
 * surfaces first: ward name starts with the query, then the full name (with
 * "Phường"/"Xã") does, then any word of the ward name does, then the rest.
 */
export const searchWards = (index: WardOption[], query: string, limit = 30) => {
  const folded = foldVietnamese(query);
  if (!folded) return { results: [] as WardOption[], total: 0 };
  const words = folded.split(" ");

  const ranked: { option: WardOption; rank: number }[] = [];
  for (const option of index) {
    const haystack = `${option.wardKey} ${option.provinceKey}`;
    if (!words.every((word) => haystack.includes(word))) continue;
    const rank = option.coreKey.startsWith(folded)
      ? 0
      : option.wardKey.startsWith(folded)
        ? 1
        : option.coreKey.split(" ").some((part) => part.startsWith(words[0]!))
          ? 2
          : 3;
    ranked.push({ option, rank });
  }

  ranked.sort((a, b) => a.rank - b.rank || a.option.coreKey.localeCompare(b.option.coreKey));
  return { results: ranked.slice(0, limit).map((r) => r.option), total: ranked.length };
};

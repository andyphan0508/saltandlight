export const SORT_OPTIONS = [
  { value: "latest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp đến cao" },
  { value: "price-desc", label: "Giá: Cao đến thấp" },
  { value: "name-asc", label: "Tên: A-Z" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortOption = "latest";

export const isSortOption = (value: unknown): value is SortOption => SORT_OPTIONS.some((option) => option.value === value);

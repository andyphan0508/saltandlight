import type { SortOption } from "@/lib/queries";

export interface CatalogSearchParams {
  q?: string;
  categories?: string;
  sizes?: string;
  onSale?: string;
  sort?: string;
  view?: string;
  page?: string;
}

export interface CatalogFilters {
  query?: string;
  categorySlugs: string[];
  sizes: string[];
  onSale: boolean;
  sort: SortOption;
  view: "2" | "3" | "4" | "list";
  page: number;
}

const VALID_SORTS: SortOption[] = ["latest", "price-asc", "price-desc", "name-asc"];
const VALID_VIEWS = ["2", "3", "4", "list"] as const;

/** Single source of truth for turning the route's raw searchParams into typed filters. */
export function parseCatalogParams(searchParams: CatalogSearchParams): CatalogFilters {
  return {
    query: searchParams.q?.trim() || undefined,
    categorySlugs: searchParams.categories?.split(",").filter(Boolean) ?? [],
    sizes: searchParams.sizes?.split(",").filter(Boolean) ?? [],
    onSale: searchParams.onSale === "1",
    sort: (VALID_SORTS.includes(searchParams.sort as SortOption) ? searchParams.sort : "latest") as SortOption,
    view: (VALID_VIEWS.includes(searchParams.view as never) ? searchParams.view : "3") as CatalogFilters["view"],
    page: Math.max(1, Number(searchParams.page) || 1),
  };
}

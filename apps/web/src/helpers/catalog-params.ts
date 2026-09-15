import { DEFAULT_SORT, isSortOption, type SortOption } from "./catalog-sort";

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

const VALID_VIEWS = ["2", "3", "4", "list"] as const;

/** Single source of truth for turning the route's raw searchParams into typed filters. */
export const parseCatalogParams = (searchParams: CatalogSearchParams): CatalogFilters => {
  const rawCategories = searchParams.categories ?? (searchParams as { category?: string | string[] }).category;
  const categoriesStr = Array.isArray(rawCategories) ? rawCategories.join(",") : (rawCategories || "");
  const rawSizes = searchParams.sizes;
  const sizesStr = Array.isArray(rawSizes) ? rawSizes.join(",") : (rawSizes || "");

  const sortVal = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort;
  const viewVal = Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view;
  const pageVal = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const qVal = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const onSaleVal = Array.isArray(searchParams.onSale) ? searchParams.onSale[0] : searchParams.onSale;

  return {
    query: qVal?.trim() || undefined,
    categorySlugs: categoriesStr.split(",").map((s) => s.trim()).filter(Boolean),
    sizes: sizesStr.split(",").map((s) => s.trim()).filter(Boolean),
    onSale: onSaleVal === "1",
    sort: isSortOption(sortVal) ? sortVal : DEFAULT_SORT,
    view: (VALID_VIEWS.includes(viewVal as never) ? viewVal : "3") as CatalogFilters["view"],
    page: Math.max(1, Number(pageVal) || 1),
  };
};

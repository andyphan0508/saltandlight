import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_SORT } from "@/helpers/catalog-sort";

const parseList = (param: string | null): string[] => (param ? param.split(",").filter(Boolean) : []);

const toggleValue = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const setListParam = (params: URLSearchParams, key: string, values: string[]) => {
  if (values.length) params.set(key, values.join(","));
  else params.delete(key);
};

/** Catalog filter state read from the URL (categories, sizes, sale, sort) plus the actions that rewrite it. */
export const useCatalogFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategories = parseList(searchParams.get("categories"));
  const activeSizes = parseList(searchParams.get("sizes"));
  const isOnSale = searchParams.get("onSale") === "1";
  const activeSort = searchParams.get("sort") ?? DEFAULT_SORT;
  // The default sort is not counted as an active filter
  const activeFilterCount =
    activeCategories.length + activeSizes.length + (isOnSale ? 1 : 0) + (activeSort !== DEFAULT_SORT ? 1 : 0);

  const onUpdateParams = (update: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    update(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    activeCategories,
    activeSizes,
    activeSort,
    activeFilterCount,
    isOnSale,
    hasActiveFilters: activeFilterCount > 0,
    onToggleCategory: (slug: string) =>
      onUpdateParams((params) => setListParam(params, "categories", toggleValue(activeCategories, slug))),
    onSetSingleCategory: (slug: string | null) =>
      onUpdateParams((params) => setListParam(params, "categories", slug ? [slug] : [])),
    onToggleSize: (size: string) =>
      onUpdateParams((params) => setListParam(params, "sizes", toggleValue(activeSizes, size))),
    onToggleOnSale: () => onUpdateParams((params) => (isOnSale ? params.delete("onSale") : params.set("onSale", "1"))),
    onSetSort: (sort: string) =>
      onUpdateParams((params) => (sort === DEFAULT_SORT ? params.delete("sort") : params.set("sort", sort))),
    onClearAll: () => router.push(pathname, { scroll: false }),
  };
};

export type CatalogFiltersState = ReturnType<typeof useCatalogFilters>;

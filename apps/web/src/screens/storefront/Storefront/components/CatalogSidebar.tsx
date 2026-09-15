import { getCachedCategoriesWithCounts, getCachedAvailableSizes } from "@/server/queries";
import { ProductFilters } from "./ProductFilters";

/**
 * Its own Suspense boundary (see page.tsx) — the category/size lookups are
 * cached in memory/edge, so this streams in instantly (0ms) without DB overhead.
 */
export const CatalogSidebar = async () => {
  const [{ categories, totalPublished }, sizes] = await Promise.all([
    getCachedCategoriesWithCounts(),
    getCachedAvailableSizes(),
  ]);

  return <ProductFilters categories={categories} sizes={sizes} totalCount={totalPublished} />;
};

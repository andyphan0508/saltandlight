import { getCachedCategoriesWithCounts } from "@/server/queries";
import { ProductFilters } from "./ProductFilters";

/**
 * Its own Suspense boundary (see page.tsx) — the category lookup is cached in
 * memory/edge, so this streams in instantly (0ms) without DB overhead.
 */
export const CatalogSidebar = async () => {
  const { categories, totalPublished } = await getCachedCategoriesWithCounts();

  return <ProductFilters categories={categories} totalCount={totalPublished} />;
};

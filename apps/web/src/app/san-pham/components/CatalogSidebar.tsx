import { getCachedCategoriesWithCounts, getCachedAvailableSizes } from "@/lib/queries";
import { ProductFilters } from "@/components/ProductFilters";

/**
 * Its own Suspense boundary (see page.tsx) — the category/size lookups are
 * cached in memory/edge, so this streams in instantly (0ms) without DB overhead.
 */
export async function CatalogSidebar() {
  const [{ categories, totalPublished }, sizes] = await Promise.all([
    getCachedCategoriesWithCounts(),
    getCachedAvailableSizes(),
  ]);

  return <ProductFilters categories={categories} sizes={sizes} totalCount={totalPublished} />;
}

import { listCategoriesWithCounts, listAvailableSizes } from "@/lib/queries";
import { ProductFilters } from "@/components/ProductFilters";

/**
 * Its own Suspense boundary (see page.tsx) — the category/size lookups are
 * cheap indexed queries, so this streams in independently of (and usually
 * well before) the product results below it.
 */
export async function CatalogSidebar() {
  const [{ categories, totalPublished }, sizes] = await Promise.all([
    listCategoriesWithCounts(),
    listAvailableSizes(),
  ]);

  return <ProductFilters categories={categories} sizes={sizes} totalCount={totalPublished} />;
}

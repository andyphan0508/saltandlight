import { getCachedPublishedProducts } from "@/server/queries";
import { toPlain } from "@/helpers/serialize";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductToolbar } from "./ProductToolbar";
import { Pagination } from "./Pagination";
import type { CatalogFilters } from "@/helpers/catalog-params";

const PAGE_SIZE = 12;

/**
 * The catalog query is cached with unstable_cache and tags: ["products"]
 * so category/page switches stream instantly with near-zero database latency.
 */
export const CatalogResults = async ({ filters }: { filters: CatalogFilters }) => {
  const { products, total } = await getCachedPublishedProducts({
    query: filters.query,
    categorySlugs: filters.categorySlugs,
    sizes: filters.sizes,
    onSale: filters.onSale,
    sort: filters.sort,
    page: filters.page,
    pageSize: PAGE_SIZE,
  });

  const plainProducts = toPlain(products);
  const from = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(filters.page * PAGE_SIZE, total);

  return (
    <>
      <ProductToolbar total={total} from={from} to={to} />
      <div className="mt-6">
        <ProductGrid products={plainProducts} view={filters.view} />
      </div>
      <Pagination total={total} pageSize={PAGE_SIZE} />
    </>
  );
};

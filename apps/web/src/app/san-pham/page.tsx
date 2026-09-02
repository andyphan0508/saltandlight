import { Suspense } from "react";
import { CatalogHero } from "./components/CatalogHero";
import { CatalogSidebar } from "./components/CatalogSidebar";
import { CatalogSidebarSkeleton } from "./components/CatalogSidebarSkeleton";
import { CatalogResults } from "./components/CatalogResults";
import { CatalogResultsSkeleton } from "./components/CatalogResultsSkeleton";
import { parseCatalogParams, type CatalogSearchParams } from "./components/parseCatalogParams";

export const metadata = {
  title: "Tất cả sản phẩm · Áo Thun & Quà Tặng Lời Chúa",
  description:
    "Khám phá bộ sưu tập áo thun Cơ Đốc, túi tote canvas và quà tặng đức tin cao cấp tại Salt & Light.",
};
export const dynamic = "force-dynamic";

export default function ProductsPage({ searchParams }: { searchParams: CatalogSearchParams }) {
  const filters = parseCatalogParams(searchParams);
  const resultsKey = JSON.stringify(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <CatalogHero query={filters.query} />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <Suspense fallback={<CatalogSidebarSkeleton />}>
          <CatalogSidebar />
        </Suspense>

        <div className="min-w-0 flex-1">
          <Suspense key={resultsKey} fallback={<CatalogResultsSkeleton view={filters.view} />}>
            <CatalogResults filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

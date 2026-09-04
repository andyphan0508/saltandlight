import { CatalogSidebarSkeleton } from "./components/CatalogSidebarSkeleton";
import { CatalogResultsSkeleton } from "./components/CatalogResultsSkeleton";

/**
 * Next.js renders this the instant navigation to /san-pham starts (before
 * any server data is fetched) — the granular <Suspense> boundaries inside
 * page.tsx take over from here once the RSC payload starts streaming.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:py-10">
      <div className="h-3 w-32 rounded bg-ink/5" />
      <div className="mt-3 h-9 w-64 rounded bg-ink/10" />
      <div className="mt-2 h-4 w-full max-w-2xl rounded bg-ink/5" />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <CatalogSidebarSkeleton />
        <div className="min-w-0 flex-1">
          <CatalogResultsSkeleton />
        </div>
      </div>
    </div>
  );
}

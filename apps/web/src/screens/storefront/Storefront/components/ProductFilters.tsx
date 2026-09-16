"use client";

import { useState } from "react";
import { useCatalogFilters } from "@/hooks/use-catalog-filters";
import type { CategoryOption } from "@/interfaces/catalog";
import { FilterSheet } from "./FilterSheet";
import { FilterSidebar } from "./FilterSidebar";
import { MobileFilterBar } from "./MobileFilterBar";

interface ProductFiltersProps {
  categories: CategoryOption[];
  totalCount: number;
}

/** Catalog filters: pill bar + bottom sheet on mobile, sidebar on desktop. Filter state lives in the URL. */
export const ProductFilters = ({ categories, totalCount }: ProductFiltersProps) => {
  const filters = useCatalogFilters();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <MobileFilterBar
        categories={categories}
        totalCount={totalCount}
        filters={filters}
        onOpenSheet={() => setIsSheetOpen(true)}
      />
      {isSheetOpen && (
        <FilterSheet
          categories={categories}
          totalCount={totalCount}
          filters={filters}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
      <FilterSidebar categories={categories} totalCount={totalCount} filters={filters} />
    </>
  );
};

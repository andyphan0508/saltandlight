"use client";

import { ChevronDown, SlidersHorizontal } from "@/components/Icons";
import { SORT_OPTIONS } from "@/helpers/catalog-sort";
import type { CatalogFiltersState } from "@/hooks/use-catalog-filters";
import type { CategoryOption } from "@/interfaces/catalog";

interface MobileFilterBarProps {
  categories: CategoryOption[];
  totalCount: number;
  filters: CatalogFiltersState;
  onOpenSheet: () => void;
}

/** Mobile-only category pills, the filter/sort sheet trigger and a quick on-sale toggle. */
export const MobileFilterBar = ({ categories, totalCount, filters, onOpenSheet }: MobileFilterBarProps) => {
  const { activeCategories, activeSort, activeFilterCount, hasActiveFilters, isOnSale, onSetSingleCategory, onToggleOnSale } =
    filters;
  const currentSort = SORT_OPTIONS.find((option) => option.value === activeSort) ?? SORT_OPTIONS[0];

  return (
    <div className="block lg:hidden w-full space-y-3 mb-2">
      {/* Row 1: Horizontal Category Selection Pills */}
      <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-1 -mx-4 px-4">
        <button
          type="button"
          onClick={() => onSetSingleCategory(null)}
          className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active-press ${
            activeCategories.length === 0
              ? "bg-ink text-white shadow-sm"
              : "bg-white border border-ink/10 text-ink/75 hover:bg-ink/5"
          }`}
        >
          <span>Tất cả</span>
          <span className={`text-[10px] ${activeCategories.length === 0 ? "text-white/60" : "text-ink/40"}`}>
            ({totalCount})
          </span>
        </button>

        {categories.map((c) => {
          const isSelected = activeCategories.includes(c.slug);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSetSingleCategory(isSelected && activeCategories.length === 1 ? null : c.slug)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all active-press ${
                isSelected
                  ? "bg-brand-forest text-white shadow-sm"
                  : "bg-white border border-ink/10 text-ink/75 hover:bg-ink/5"
              }`}
            >
              <span>{c.name}</span>
              <span className={`text-[10px] ${isSelected ? "text-white/70" : "text-ink/40"}`}>({c.count})</span>
            </button>
          );
        })}
      </div>

      {/* Row 2: Action bar (Filter & Sort Sheet Trigger + Quick On-Sale Toggle) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSheet}
            className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all active-press shadow-xs ${
              hasActiveFilters
                ? "border-brand-forest bg-mint-50 text-brand-forest font-bold"
                : "border-ink/15 bg-white text-ink hover:bg-ink/5"
            }`}
          >
            <SlidersHorizontal size={15} className={hasActiveFilters ? "text-brand-forest" : "text-ink/70"} />
            <span>Bộ lọc &amp; Sắp xếp</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-forest px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleOnSale}
            className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition-all active-press ${
              isOnSale
                ? "border-sale bg-rose-50 text-sale shadow-xs font-bold"
                : "border-ink/15 bg-white text-ink/70 hover:bg-ink/5"
            }`}
          >
            <span>⚡ Giảm giá</span>
          </button>
        </div>

        {/* Quick Sort Preview Indicator */}
        <button
          type="button"
          onClick={onOpenSheet}
          className="flex items-center gap-1 text-xs font-semibold text-ink/60 hover:text-ink active-press"
        >
          <span>{currentSort.label}</span>
          <ChevronDown size={14} className="text-ink/40" />
        </button>
      </div>
    </div>
  );
};

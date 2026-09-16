"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "@/components/Icons";
import type { CatalogFiltersState } from "@/hooks/use-catalog-filters";
import type { CategoryOption } from "@/interfaces/catalog";

interface FilterSidebarProps {
  categories: CategoryOption[];
  totalCount: number;
  filters: CatalogFiltersState;
}

/** Desktop filter sidebar with a collapsible category section. */
export const FilterSidebar = ({ categories, totalCount, filters }: FilterSidebarProps) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const {
    activeCategories,
    hasActiveFilters,
    isOnSale,
    onClearAll,
    onSetSingleCategory,
    onToggleCategory,
    onToggleOnSale,
  } = filters;

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
      <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/75 shadow-card hover:border-ink/25 transition-colors">
        <input type="checkbox" checked={isOnSale} onChange={onToggleOnSale} className="h-4 w-4 rounded accent-brand-forest" />
        <span className="font-semibold text-xs text-ink">Chỉ hiện sản phẩm đang giảm giá</span>
      </label>

      <FilterSection title="Danh mục sản phẩm" isOpen={isCategoriesOpen} onToggle={() => setIsCategoriesOpen((v) => !v)}>
        <FilterRow
          label="Tất cả sản phẩm"
          count={totalCount}
          isChecked={activeCategories.length === 0}
          onChange={() => onSetSingleCategory(null)}
        />
        {categories.map((c) => (
          <FilterRow
            key={c.id}
            label={c.name}
            count={c.count}
            isChecked={activeCategories.includes(c.slug)}
            onChange={() => onToggleCategory(c.slug)}
          />
        ))}
      </FilterSection>


      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-forest hover:underline pt-1"
        >
          <RotateCcw size={13} />
          <span>Xóa tất cả bộ lọc</span>
        </button>
      )}
    </aside>
  );
};

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const FilterSection = ({ title, isOpen, onToggle, children }: FilterSectionProps) => (
  <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-ink"
    >
      {title}
      {isOpen ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />}
    </button>
    {isOpen && <div className="mt-3 space-y-2.5">{children}</div>}
  </div>
);

interface FilterRowProps {
  label: string;
  count: number;
  isChecked: boolean;
  onChange: () => void;
}

const FilterRow = ({ label, count, isChecked, onChange }: FilterRowProps) => (
  <label className="flex cursor-pointer items-center justify-between gap-2 text-xs font-medium text-ink/75 hover:text-ink">
    <span className="flex items-center gap-2.5">
      <input type="checkbox" checked={isChecked} onChange={onChange} className="h-4 w-4 rounded accent-brand-forest" />
      {label}
    </span>
    <span className="text-[11px] text-ink/40">({count})</span>
  </label>
);

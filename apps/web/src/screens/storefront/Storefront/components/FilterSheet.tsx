"use client";

import { Check, RotateCcw, SlidersHorizontal, X } from "@/components/Icons";
import { SORT_OPTIONS } from "@/helpers/catalog-sort";
import type { CatalogFiltersState } from "@/hooks/use-catalog-filters";
import type { CategoryOption } from "@/interfaces/catalog";

interface FilterSheetProps {
  categories: CategoryOption[];
  totalCount: number;
  filters: CatalogFiltersState;
  onClose: () => void;
}

/** Mobile bottom sheet for sort, category and sale filters. `data-modal` locks page scroll (globals.css). */
export const FilterSheet = ({ categories, totalCount, filters, onClose }: FilterSheetProps) => {
  const {
    activeCategories,
    activeSort,
    hasActiveFilters,
    isOnSale,
    onClearAll,
    onSetSingleCategory,
    onSetSort,
    onToggleCategory,
    onToggleOnSale,
  } = filters;

  return (
    <div data-modal className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* BottomSheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tùy chọn lọc và sắp xếp sản phẩm"
        className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-[32px] bg-[#FDFBF7] shadow-[0_-16px_50px_rgba(0,0,0,0.25)] border-t border-ink/10 animate-sheet-up overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-pointer flex-shrink-0" onClick={onClose}>
          <div className="h-1.5 w-12 rounded-full bg-ink/20 hover:bg-ink/40 transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/5 px-6 pb-3 pt-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-brand-forest" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Bộ Lọc &amp; Sắp Xếp</h3>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAll}
                className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-sale hover:bg-rose-50 active-press"
              >
                <RotateCcw size={12} />
                <span>Đặt lại</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/70 hover:bg-ink/10 active-press"
              aria-label="Đóng bộ lọc"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto native-scroll px-6 py-4 space-y-6">
          {/* Sort */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 block mb-2.5">Sắp xếp theo</span>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((option) => {
                const isSelected = activeSort === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSetSort(option.value)}
                    className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all active-press border ${
                      isSelected
                        ? "bg-ink text-white border-ink shadow-sm"
                        : "bg-white border-ink/10 text-ink/75 hover:bg-ink/5"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Danh mục sản phẩm</span>
              {activeCategories.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSetSingleCategory(null)}
                  className="text-[11px] font-bold text-brand-forest hover:underline"
                >
                  Chọn tất cả
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSetSingleCategory(null)}
                className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all active-press border ${
                  activeCategories.length === 0
                    ? "bg-brand-forest text-white border-brand-forest shadow-sm"
                    : "bg-white border-ink/10 text-ink/75 hover:bg-ink/5"
                }`}
              >
                <span>Tất cả</span>
                <span className="text-[10px] opacity-70">({totalCount})</span>
              </button>

              {categories.map((c) => {
                const isChecked = activeCategories.includes(c.slug);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onToggleCategory(c.slug)}
                    className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all active-press border ${
                      isChecked
                        ? "bg-brand-forest text-white border-brand-forest shadow-sm"
                        : "bg-white border-ink/10 text-ink/75 hover:bg-ink/5"
                    }`}
                  >
                    <span className="truncate mr-1">{c.name}</span>
                    <span className="text-[10px] opacity-70 flex-shrink-0">({c.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* On sale */}
          <div className="rounded-2xl border border-ink/10 bg-white p-4">
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-sale">⚡</span>
                <div>
                  <p className="text-xs font-bold text-ink">Chỉ hiện sản phẩm đang giảm giá</p>
                  <p className="text-[10px] text-ink/40">Lọc các ưu đãi và deal hot nhất</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isOnSale}
                onChange={onToggleOnSale}
                className="h-5 w-5 rounded-md accent-brand-forest"
              />
            </label>
          </div>
        </div>

        {/* Fixed Footer Action */}
        <div className="border-t border-ink/5 bg-[#FDFBF7] p-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-ink py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-ink/90 active-press"
          >
            Áp Dụng Bộ Lọc
          </button>
        </div>
      </div>
    </div>
  );
};

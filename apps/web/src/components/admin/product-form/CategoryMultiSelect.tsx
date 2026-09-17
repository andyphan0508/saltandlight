"use client";

import { useState } from "react";
import type { CategorySelection } from "@/helpers/category-selection";
import type { ProductCategoryOption } from "@/interfaces/product-form";
import { Check, Search, Star } from "../Icons";

interface CategoryMultiSelectProps {
  categories: ProductCategoryOption[];
  selection: CategorySelection;
  onToggle: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

// Past this many chips, scanning gets slower than typing
const FILTER_THRESHOLD = 8;

/**
 * Pick every category a product belongs to, then mark one as primary. Chips
 * rather than a native <select multiple>: that control needs Ctrl/Cmd-click,
 * which most admins don't know, and loses the whole selection on a plain click.
 */
export const CategoryMultiSelect = ({ categories, selection, onToggle, onSetPrimary }: CategoryMultiSelectProps) => {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = needle ? categories.filter((c) => c.name.toLowerCase().includes(needle)) : categories;
  const nameOf = (id: string | null) => categories.find((c) => c.id === id)?.name;

  return (
    <fieldset className="space-y-2.5">
      <legend className="text-xs font-bold uppercase tracking-wider text-slate-600">
        Danh mục sản phẩm <span className="font-medium normal-case tracking-normal text-slate-400">(chọn được nhiều)</span>
      </legend>

      {categories.length > FILTER_THRESHOLD && (
        <div className="relative max-w-xs">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lọc danh mục…"
            aria-label="Lọc danh mục"
            className="w-full rounded-full border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-brand-forest focus:outline-none"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {visible.map((category) => {
          const isSelected = selection.categoryIds.includes(category.id);
          const isPrimary = selection.primaryId === category.id;
          return (
            <div
              key={category.id}
              className={`inline-flex items-center overflow-hidden rounded-full border text-xs font-bold transition-colors ${
                isSelected ? "border-brand-forest bg-brand-forest text-white" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggle(category.id)}
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-1.5 py-1.5 pl-3 ${isSelected ? "pr-2" : "pr-3 hover:bg-slate-50"}`}
              >
                {isSelected && <Check size={12} />}
                {category.name}
              </button>
              {isSelected && (
                <button
                  type="button"
                  onClick={() => onSetPrimary(category.id)}
                  disabled={isPrimary}
                  aria-label={isPrimary ? `${category.name} là danh mục chính` : `Đặt ${category.name} làm danh mục chính`}
                  title={isPrimary ? "Danh mục chính" : "Đặt làm danh mục chính"}
                  className={`border-l border-white/25 py-1.5 pl-2 pr-2.5 ${isPrimary ? "text-amber-300" : "text-white/50 hover:text-white"}`}
                >
                  <Star size={12} fill={isPrimary ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          );
        })}
        {visible.length === 0 && <span className="text-xs text-slate-400">Không có danh mục khớp “{query}”.</span>}
      </div>

      <p className="text-[11px] text-slate-500">
        {selection.categoryIds.length === 0 ? (
          "Chưa chọn danh mục nào — sản phẩm sẽ không xuất hiện khi khách lọc theo danh mục."
        ) : (
          <>
            Hiện trong <strong>{selection.categoryIds.length}</strong> danh mục. ★ Danh mục chính:{" "}
            <strong>{nameOf(selection.primaryId)}</strong> — dùng cho đường dẫn điều hướng, sản phẩm liên quan và bảng
            size.
          </>
        )}
      </p>
    </fieldset>
  );
};

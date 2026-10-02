"use client";

import { useState } from "react";
import { formatVND } from "@saltandlight/domain";
import type { PromotionProductOption } from "@/interfaces/promotion";

interface ProductChecklistProps {
  products: PromotionProductOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/** Searchable checkbox list of the products a promotion applies to. */
export const ProductChecklist = ({ products, selectedIds, onChange }: ProductChecklistProps) => {
  const [query, setQuery] = useState("");
  const isAllSelected = selectedIds.length === products.length;
  const visibleProducts = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const onToggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-ink">Sản phẩm áp dụng ({selectedIds.length} đã chọn)</label>
        <button
          type="button"
          onClick={() => onChange(isAllSelected ? [] : products.map((p) => p.id))}
          className="text-xs font-bold text-brand-forest hover:underline"
        >
          {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm sản phẩm theo tên..."
        className="w-full rounded-xl border border-ink/15 px-3 py-1.5 text-xs focus:border-brand-forest focus:outline-none"
      />

      <div className="max-h-40 overflow-y-auto rounded-xl border border-ink/10 p-2 space-y-1 bg-slate-50">
        {visibleProducts.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          return (
            <label
              key={product.id}
              className={`flex items-center justify-between rounded-lg p-2 text-xs cursor-pointer transition-colors ${
                isSelected ? "bg-mint-100 text-brand-forest font-bold" : "hover:bg-white text-ink"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(product.id)}
                  className="h-4 w-4 rounded accent-brand-forest"
                />
                <span className="line-clamp-1">{product.name}</span>
              </div>
              {product.minPrice && (
                <span className="text-[11px] text-ink/50 shrink-0 font-normal">{formatVND(product.minPrice)}</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

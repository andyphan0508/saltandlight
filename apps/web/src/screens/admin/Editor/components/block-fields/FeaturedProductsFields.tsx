"use client";

import { useEffect, useState } from "react";
import { Button } from "@saltandlight/ui";
import { adminFetch } from "@/api/admin-fetch";
import { TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";
import { ProductPickerModal } from "../ProductPickerModal";

interface CategoryChoice {
  id: string;
  name: string;
  slug: string;
}

const SOURCE_TYPES = [
  { id: "all", label: "Sản phẩm bán chạy / nổi bật" },
  { id: "category", label: "Theo Danh mục / Mùa" },
  { id: "manual", label: "Tự chọn từng sản phẩm" },
];

const choiceClass = (isSelected: boolean, size = "py-2 font-bold") =>
  `rounded-lg ${size} px-3 text-xs border transition-all ${
    isSelected ? "bg-brand-forest text-white border-brand-forest shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
  }`;

/** Fields for FEATURED_PRODUCTS and PRODUCT_LIST blocks: product source, layout, titles and the "view all" button. */
export const FeaturedProductsFields = ({ content, onPatch, isProductList }: BlockFieldsProps & { isProductList?: boolean }) => {
  const [categories, setCategories] = useState<CategoryChoice[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    adminFetch<{ categories?: CategoryChoice[] }>("/api/admin/categories")
      .then((data) => setCategories(data.categories ?? []))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const sourceType = content.sourceType || (isProductList ? "category" : "all");
  const displayMode = content.displayMode || "grid";
  const isViewAllAllowed = content.allowViewAll ?? true;
  const viewAllMode = content.viewAllMode || (isProductList ? "modal" : "link");
  const selectedCount = (content.productIds || []).length;

  const onCategorySelect = (categoryId: string) => {
    const selected = categories.find((c) => c.id === categoryId);
    if (!selected) {
      onPatch({ categoryId: null, categoryName: "", categorySlug: "" });
      return;
    }
    onPatch({
      categoryId: selected.id,
      categoryName: selected.name,
      categorySlug: selected.slug,
      headline: content.headline || selected.name,
      ctaLabel: content.ctaLabel || `Xem tất cả ${selected.name}`,
      ctaHref: `/san-pham?categories=${selected.slug}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Source Type */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Nguồn lấy sản phẩm để hiển thị</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SOURCE_TYPES.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => onPatch({ sourceType: source.id })}
              className={choiceClass(sourceType === source.id)}
            >
              {source.label}
            </button>
          ))}
        </div>

        {sourceType === "category" && (
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700">Chọn Danh mục / Bộ sưu tập theo mùa</label>
            <select
              value={content.categoryId || ""}
              onChange={(e) => onCategorySelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
            >
              <option value="">-- Chọn một danh mục hoặc bộ sưu tập --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {content.categorySlug && (
              <p className="text-[11px] text-slate-500">
                Đường dẫn liên kết tự động:{" "}
                <code className="text-brand-forest font-semibold">/san-pham?categories={content.categorySlug}</code>
              </p>
            )}
          </div>
        )}

        {sourceType === "manual" && (
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Số sản phẩm đã chọn: <span className="text-brand-forest font-bold">{selectedCount}</span>
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPickerOpen(true)}
                className="text-xs font-bold !bg-white hover:!bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
              >
                Chọn sản phẩm từ danh sách
              </Button>
            </div>
            {selectedCount === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Chưa có sản phẩm nào được chọn. Nhấn nút &quot;Chọn sản phẩm từ danh sách&quot; để tích chọn các sản phẩm bạn muốn
                hiển thị trong khối này.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Display Mode */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Bố cục hiển thị trên trang web</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onPatch({ displayMode: "grid" })} className={choiceClass(displayMode === "grid")}>
            Dạng lưới sản phẩm (Nhiều hàng cột)
          </button>
          <button type="button" onClick={() => onPatch({ displayMode: "slider" })} className={choiceClass(displayMode === "slider")}>
            Dạng thanh trượt ngang (Lướt xem qua lại)
          </button>
        </div>
      </div>

      {/* 3. Titles */}
      <TextField
        label="Dòng chữ nhỏ trên tiêu đề (Không bắt buộc)"
        value={content.eyebrow || ""}
        onChange={(v) => onPatch({ eyebrow: v })}
        placeholder="Ví dụ: Bộ sưu tập mới, Bán chạy nhất, Xu hướng mùa này..."
      />
      <TextField
        label="Tiêu đề chính của khối"
        value={content.headline || ""}
        onChange={(v) => onPatch({ headline: v })}
        required
        placeholder="Ví dụ: Sản phẩm nổi bật, Áo thun Cơ Đốc, Quà tặng ý nghĩa..."
      />

      {/* 4. Count */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng sản phẩm hiển thị trên trang (Tối đa)</label>
        <input
          type="number"
          min={1}
          max={36}
          value={content.count ?? 8}
          onChange={(e) => onPatch({ count: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
        />
      </div>

      {/* 5. View all */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isViewAllAllowed}
            onChange={(e) => onPatch({ allowViewAll: e.target.checked })}
            className="rounded border-slate-300 text-brand-forest focus:ring-brand-forest h-4 w-4"
          />
          <span className="text-xs font-bold text-slate-800">Hiển thị nút &quot;Xem tất cả&quot; cho khách hàng</span>
        </label>

        {isViewAllAllowed && (
          <div className="pt-2 border-t border-slate-200/80 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hành động khi khách hàng bấm nút &quot;Xem tất cả&quot;
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onPatch({ viewAllMode: "modal" })}
                  className={choiceClass(viewAllMode === "modal", "py-1.5 font-semibold")}
                >
                  Mở danh sách xem nhanh (Modal popup trên trang)
                </button>
                <button
                  type="button"
                  onClick={() => onPatch({ viewAllMode: "link" })}
                  className={choiceClass(viewAllMode === "link", "py-1.5 font-semibold")}
                >
                  Chuyển sang trang danh mục sản phẩm (/san-pham...)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Chữ trên nút bấm"
                value={content.ctaLabel || "Xem tất cả"}
                onChange={(v) => onPatch({ ctaLabel: v })}
                required
                placeholder="Ví dụ: Xem tất cả sản phẩm"
              />
              <TextField
                label="Đường dẫn khi bấm nút"
                value={content.ctaHref || "/san-pham"}
                onChange={(v) => onPatch({ ctaHref: v })}
                required
                placeholder="Ví dụ: /san-pham"
              />
            </div>
          </div>
        )}
      </div>

      <ProductPickerModal
        isOpen={isPickerOpen}
        selectedIds={content.productIds || []}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(ids) => onPatch({ productIds: ids })}
      />
    </div>
  );
};

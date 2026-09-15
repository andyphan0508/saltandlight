"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import { Modal } from "@/components/Modal";
import { adminFetch } from "@/api/admin-fetch";
import { Search, X, Check, Package, LayoutGrid } from "@/components/admin/Icons";

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  categoryId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  images?: { url: string }[];
  variants?: { price: number | string; compareAtPrice?: number | string | null }[];
  minPrice?: number | string | null;
}

interface ProductPickerModalProps {
  isOpen: boolean;
  selectedIds: string[];
  onClose: () => void;
  onSelect: (ids: string[]) => void;
}

export const ProductPickerModal = ({ isOpen, selectedIds, onClose, onSelect }: ProductPickerModalProps) => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (!isOpen) return;
    setTempSelected(selectedIds);
    setIsLoading(true);
    adminFetch<{ products?: ProductSummary[] }>("/api/admin/products")
      .then((data) => setProducts(data.products ?? []))
      .catch((err) => console.error("Failed to load products for picker:", err))
      .finally(() => setIsLoading(false));
  }, [isOpen, selectedIds]);

  const categories = Array.from(
    new Map(products.filter((p) => p.category).map((p) => [p.category!.id, p.category!.name])).entries(),
  );

  const query = search.toLowerCase().trim();
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query) ||
      Boolean(p.category?.name.toLowerCase().includes(query))
    );
  });
  const isAllSelected = filteredProducts.length > 0 && tempSelected.length === filteredProducts.length;

  const onToggleProduct = (id: string) =>
    setTempSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const onToggleAll = () => setTempSelected(isAllSelected ? [] : filteredProducts.map((p) => p.id));

  const onConfirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable
      labelledBy="product-picker-title"
      className="bg-white max-w-3xl rounded-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
        <div>
          <h3 id="product-picker-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Package size={18} className="text-brand-forest" />
            <span>Chọn danh sách sản phẩm hiển thị</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Đã chọn: <strong className="text-brand-forest">{tempSelected.length}</strong> sản phẩm
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white flex-shrink-0">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, bộ sưu tập..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-brand-forest focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả danh mục ({products.length})</option>
            {categories.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {filteredProducts.length > 0 && (
            <button
              type="button"
              onClick={onToggleAll}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          )}
        </div>
      </div>

      {/* Product Items List */}
      <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <div className="animate-spin h-6 w-6 border-2 border-brand-forest border-t-transparent rounded-full mx-auto mb-2" />
            Đang tải danh sách sản phẩm...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <LayoutGrid size={32} className="mx-auto mb-2 opacity-30" />
            Không tìm thấy sản phẩm nào
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const isSelected = tempSelected.includes(prod.id);
            const imageUrl = prod.images?.[0]?.url;
            const prices = prod.variants?.map((v) => Number(v.price)) || [];
            const minPrice = prices.length ? Math.min(...prices) : Number(prod.minPrice || 0);

            return (
              <div
                key={prod.id}
                onClick={() => onToggleProduct(prod.id)}
                className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected ? "bg-mint-50/80 border border-mint-200/80 shadow-xs" : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors flex-shrink-0 ${
                    isSelected ? "bg-brand-forest border-brand-forest text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <Check size={13} />}
                </div>

                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/60 flex-shrink-0">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={prod.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    <Package size={20} className="m-auto text-slate-300 h-full w-full p-2" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">{prod.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {prod.category && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {prod.category.name}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-brand-forest">
                      {minPrice > 0 ? formatVND(minPrice) : "Liên hệ"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
        <span className="text-xs text-slate-500 font-medium">
          Đã chọn {tempSelected.length} / {products.length} sản phẩm
        </span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold">
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="rounded-xl px-5 py-2 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
          >
            Xác nhận chọn ({tempSelected.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

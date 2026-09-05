"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatVND } from "@saltandlight/domain";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  Tag,
  Calendar,
  Check,
  X,
  Sparkles,
  Percent,
} from "./Icons";

export interface PromotionItem {
  id: string;
  name: string;
  badge: string | null;
  description: string | null;
  discountType: string;
  discountValue: number | string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  productIds: string[];
  createdAt: string;
}

export interface ProductOption {
  id: string;
  name: string;
  minPrice: number | null;
}

export function PromotionsManager({
  initialPromotions,
  products,
}: {
  initialPromotions: PromotionItem[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [promotions, setPromotions] = useState<PromotionItem[]>(initialPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromotionItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState<number | "">(20);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [applyPrices, setApplyPrices] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState("");

  function openCreateModal() {
    setEditingPromo(null);
    setName("");
    setBadge("GIẢM 20%");
    setDescription("");
    setDiscountType("percent");
    setDiscountValue(20);
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setSelectedProductIds([]);
    setApplyPrices(false);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(promo: PromotionItem) {
    setEditingPromo(promo);
    setName(promo.name);
    setBadge(promo.badge ?? "");
    setDescription(promo.description ?? "");
    setDiscountType(promo.discountType);
    setDiscountValue(Number(promo.discountValue));
    setStartDate(promo.startDate ? promo.startDate.slice(0, 10) : "");
    setEndDate(promo.endDate ? promo.endDate.slice(0, 10) : "");
    setIsActive(promo.isActive);
    setSelectedProductIds(promo.productIds ?? []);
    setApplyPrices(false);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleToggleActive(promo: PromotionItem) {
    const nextActive = !promo.isActive;
    setPromotions((prev) =>
      prev.map((p) => (p.id === promo.id ? { ...p, isActive: nextActive } : p)),
    );

    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(nextActive ? "Đã kích hoạt chương trình!" : "Đã tạm dừng chương trình!");
      router.refresh();
    } catch {
      setPromotions((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, isActive: promo.isActive } : p)),
      );
      toast.error("Không thể cập nhật trạng thái chương trình.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa chương trình giảm giá này?")) return;
    setIsDeletingId(id);

    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã xóa chương trình thành công!");
      router.refresh();
    } catch {
      toast.error("Không thể xóa chương trình.");
    } finally {
      setIsDeletingId(null);
    }
  }

  function toggleProductSelection(id: string) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  }

  function selectAllProducts() {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên chương trình");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setError("Vui lòng nhập giá trị giảm giá hợp lệ");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      name,
      badge,
      description,
      discountType,
      discountValue: Number(discountValue),
      startDate: startDate || null,
      endDate: endDate || null,
      isActive,
      productIds: selectedProductIds,
      applyPrices,
    };

    try {
      const url = editingPromo ? `/api/admin/promotions/${editingPromo.id}` : "/api/admin/promotions";
      const method = editingPromo ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      toast.success(
        editingPromo ? "Cập nhật chương trình thành công!" : "Tạo chương trình giảm giá thành công!",
      );
      setIsModalOpen(false);
      router.refresh();

      // Refresh list
      const updatedList = await fetch("/api/admin/promotions").then((r) => r.json());
      if (updatedList.promotions) setPromotions(updatedList.promotions);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProductQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-black uppercase text-ink">
            Danh Sách Chương Trình ({promotions.length})
          </h2>
          <p className="text-xs text-ink/60 mt-0.5">
            Tạo và quản lý các đợt giảm giá, khuyến mãi đồng bộ trên toàn hệ thống
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brand-forest text-white"
        >
          <Plus size={16} />
          <span>Tạo Chương Trình Mới</span>
        </Button>
      </div>

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/15 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest mb-4">
            <Tag size={24} />
          </div>
          <h3 className="font-display font-black uppercase text-sm text-ink">
            Chưa có chương trình giảm giá nào
          </h3>
          <p className="text-xs text-ink/60 mt-1 max-w-sm mx-auto">
            Hãy tạo chương trình giảm giá đầu tiên để áp dụng ưu đãi và thu hút khách hàng!
          </p>
          <Button
            type="button"
            onClick={openCreateModal}
            className="mt-5 bg-brand-forest text-white"
          >
            Tạo Chương Trình Ngay
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => {
            const isPercent = promo.discountType === "percent";
            const productCount = promo.productIds?.length ?? 0;

            return (
              <div
                key={promo.id}
                className="relative flex flex-col justify-between rounded-3xl bg-white p-5 border border-ink/10 shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        promo.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          promo.isActive ? "bg-emerald-600" : "bg-slate-400"
                        }`}
                      />
                      {promo.isActive ? "Đang chạy" : "Tạm dừng"}
                    </span>

                    {promo.badge && (
                      <span className="rounded-full bg-sale-light px-2 py-0.5 text-[10px] font-black text-sale uppercase">
                        {promo.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-display font-black text-base uppercase text-ink line-clamp-1">
                    {promo.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-brand-forest">
                      {isPercent ? `Giảm ${promo.discountValue}%` : `Giảm ${formatVND(Number(promo.discountValue))}`}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ink/60 line-clamp-2">
                    {promo.description || "Chương trình áp dụng cho các sản phẩm tuyển chọn."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-ink/5 space-y-1.5 text-xs text-ink/70">
                    <div className="flex items-center justify-between">
                      <span className="text-ink/50">Sản phẩm áp dụng:</span>
                      <strong className="text-ink">
                        {productCount === 0
                          ? "Tất cả"
                          : `${productCount} sản phẩm`}
                      </strong>
                    </div>

                    {(promo.startDate || promo.endDate) && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink/50">Thời hạn:</span>
                        <span>
                          {promo.startDate ? new Date(promo.startDate).toLocaleDateString("vi-VN") : "Bắt đầu"}
                          {" → "}
                          {promo.endDate ? new Date(promo.endDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between pt-3 border-t border-ink/10">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(promo)}
                    className="text-xs font-semibold text-ink/70 hover:text-ink underline"
                  >
                    {promo.isActive ? "Tạm dừng" : "Kích hoạt"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(promo)}
                      className="p-1.5 rounded-lg text-ink/50 hover:bg-ink/5 hover:text-ink transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(promo.id)}
                      disabled={isDeletingId === promo.id}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-ink/10 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
              <h3 className="font-display font-black uppercase text-base text-ink flex items-center gap-2">
                <Tag size={18} className="text-brand-forest" />
                {editingPromo ? "Chỉnh Sửa Chương Trình Giảm Giá" : "Tạo Chương Trình Giảm Giá Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-ink/50 hover:bg-ink/5 text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  {error}
                </div>
              )}

              {/* Tên & Badge */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Tên chương trình <span className="text-sale">*</span>
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Khuyến Mãi Mùa Hè 2026"
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Huy hiệu hiển thị (Badge)
                  </label>
                  <input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="VD: GIẢM 20%, FLASH SALE"
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* Loại giảm & Giá trị giảm */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Loại giảm giá</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none bg-white"
                  >
                    <option value="percent">Giảm theo Phần trăm (%)</option>
                    <option value="fixed">Giảm số tiền cố định (VND)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Mức giảm {discountType === "percent" ? "(%)" : "(VND)"} <span className="text-sale">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value ? Number(e.target.value) : "")}
                    placeholder={discountType === "percent" ? "20" : "50000"}
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Mô tả chương trình</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Thông điệp ưu đãi gửi gắm đến khách hàng..."
                  className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none resize-none"
                />
              </div>

              {/* Thời gian */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* Chọn sản phẩm áp dụng */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink">
                    Sản phẩm áp dụng ({selectedProductIds.length} đã chọn)
                  </label>
                  <button
                    type="button"
                    onClick={selectAllProducts}
                    className="text-xs font-bold text-brand-forest hover:underline"
                  >
                    {selectedProductIds.length === products.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </button>
                </div>

                <input
                  type="text"
                  value={searchProductQuery}
                  onChange={(e) => setSearchProductQuery(e.target.value)}
                  placeholder="Tìm sản phẩm theo tên..."
                  className="w-full rounded-xl border border-ink/15 px-3 py-1.5 text-xs focus:border-brand-forest focus:outline-none"
                />

                <div className="max-h-40 overflow-y-auto rounded-xl border border-ink/10 p-2 space-y-1 bg-slate-50">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between rounded-lg p-2 text-xs cursor-pointer transition-colors ${
                          isSelected ? "bg-mint-100 text-brand-forest font-bold" : "hover:bg-white text-ink"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProductSelection(p.id)}
                            className="h-4 w-4 rounded accent-brand-forest"
                          />
                          <span className="line-clamp-1">{p.name}</span>
                        </div>
                        {p.minPrice && (
                          <span className="text-[11px] text-ink/50 shrink-0 font-normal">
                            {formatVND(p.minPrice)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tuỳ chọn cập nhật giá vào sản phẩm */}
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/80 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyPrices}
                    onChange={(e) => setApplyPrices(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-brand-forest"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-950">
                      Tự động cập nhật trực tiếp giá niêm yết và giá bán cho các sản phẩm đã chọn
                    </span>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      Hệ thống sẽ lưu giá gốc hiện tại vào giá niêm yết (compareAtPrice) và tính giá bán mới theo mức giảm của chương trình.
                    </p>
                  </div>
                </label>
              </div>

              {/* Trạng thái Kích hoạt */}
              <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-brand-forest"
                />
                <span>Kích hoạt và hiển thị chương trình trên website</span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="bg-brand-forest text-white"
                >
                  {isSaving ? "Đang lưu..." : editingPromo ? "Cập Nhật" : "Tạo Chương Trình"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

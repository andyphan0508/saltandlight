"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Modal } from "@/components/Modal";
import { Tag, X } from "@/components/admin/Icons";
import type { PromotionItem, PromotionProductOption } from "@/interfaces/promotion";
import { ProductChecklist } from "./ProductChecklist";

const inputClass = "w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none";
const labelClass = "block text-xs font-bold text-ink mb-1.5";

interface PromotionFormModalProps {
  /** The promotion to edit, or null to create one. */
  promotion: PromotionItem | null;
  products: PromotionProductOption[];
  onClose: () => void;
  onSaved: () => void;
}

/** Create/edit promotion form. Mounted once per open, so its fields start from `promotion` or the new-promotion defaults. */
export const PromotionFormModal = ({ promotion, products, onClose, onSaved }: PromotionFormModalProps) => {
  const [name, setName] = useState(promotion?.name ?? "");
  const [badge, setBadge] = useState(promotion ? (promotion.badge ?? "") : "GIẢM 20%");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [discountType, setDiscountType] = useState(promotion?.discountType ?? "percent");
  const [discountValue, setDiscountValue] = useState<number | "">(promotion ? Number(promotion.discountValue) : 20);
  const [startDate, setStartDate] = useState(promotion?.startDate?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(promotion?.endDate?.slice(0, 10) ?? "");
  const [isActive, setIsActive] = useState(promotion?.isActive ?? true);
  const [productIds, setProductIds] = useState<string[]>(promotion?.productIds ?? []);
  const [shouldApplyPrices, setShouldApplyPrices] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPercent = discountType === "percent";

  const onSubmit = async (e: FormEvent) => {
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
    try {
      await adminFetch(promotion ? `/api/admin/promotions/${promotion.id}` : "/api/admin/promotions", {
        method: promotion ? "PATCH" : "POST",
        body: {
          name,
          badge,
          description,
          discountType,
          discountValue: Number(discountValue),
          startDate: startDate || null,
          endDate: endDate || null,
          isActive,
          productIds,
          applyPrices: shouldApplyPrices,
        },
      });
      toast.success(promotion ? "Cập nhật chương trình thành công!" : "Tạo chương trình giảm giá thành công!");
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      labelledBy="promotion-form-title"
      className="bg-white max-w-2xl rounded-3xl border border-ink/10 flex flex-col max-h-[92vh] overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
        <h3 id="promotion-form-title" className="font-display font-bold uppercase text-base text-ink flex items-center gap-2">
          <Tag size={18} className="text-brand-forest" />
          {promotion ? "Chỉnh Sửa Chương Trình Giảm Giá" : "Tạo Chương Trình Giảm Giá Mới"}
        </h3>
        <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-1.5 text-ink/50 hover:bg-ink/5 text-ink">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        {error && (
          <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Tên chương trình <span className="text-sale">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Khuyến Mãi Mùa Hè 2026"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Huy hiệu hiển thị (Badge)</label>
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="VD: GIẢM 20%, FLASH SALE"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Loại giảm giá</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="percent">Giảm theo Phần trăm (%)</option>
              <option value="fixed">Giảm số tiền cố định (VND)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Mức giảm {isPercent ? "(%)" : "(VND)"} <span className="text-sale">*</span>
            </label>
            <input
              required
              type="number"
              min="1"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value ? Number(e.target.value) : "")}
              placeholder={isPercent ? "20" : "50000"}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Mô tả chương trình</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thông điệp ưu đãi gửi gắm đến khách hàng..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Ngày bắt đầu</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ngày kết thúc</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        <ProductChecklist products={products} selectedIds={productIds} onChange={setProductIds} />

        <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/80 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={shouldApplyPrices}
              onChange={(e) => setShouldApplyPrices(e.target.checked)}
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

        <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded accent-brand-forest"
          />
          <span>Kích hoạt và hiển thị chương trình trên website</span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSaving} className="bg-brand-forest text-white">
            {isSaving ? "Đang lưu..." : promotion ? "Cập Nhật" : "Tạo Chương Trình"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

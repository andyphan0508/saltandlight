"use client";

import { formatVND } from "@saltandlight/domain";
import { Pencil, Trash2 } from "@/components/admin/Icons";
import type { PromotionItem } from "@/interfaces/promotion";

interface PromotionCardProps {
  promotion: PromotionItem;
  isDeleting: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const formatDate = (value: string | null, fallback: string) => (value ? new Date(value).toLocaleDateString("vi-VN") : fallback);

/** Promotion summary card with pause/activate, edit and delete actions. */
export const PromotionCard = ({ promotion, isDeleting, onToggleActive, onEdit, onDelete }: PromotionCardProps) => {
  const isPercent = promotion.discountType === "percent";
  const productCount = promotion.productIds?.length ?? 0;

  return (
    <div className="relative flex flex-col justify-between rounded-3xl bg-white p-5 border border-ink/10 shadow-xs hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              promotion.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${promotion.isActive ? "bg-emerald-600" : "bg-slate-400"}`} />
            {promotion.isActive ? "Đang chạy" : "Tạm dừng"}
          </span>

          {promotion.badge && (
            <span className="rounded-full bg-sale-light px-2 py-0.5 text-[10px] font-bold text-sale uppercase">{promotion.badge}</span>
          )}
        </div>

        <h3 className="mt-3 font-display font-bold text-base uppercase text-ink line-clamp-1">{promotion.name}</h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-brand-forest">
            {isPercent ? `Giảm ${promotion.discountValue}%` : `Giảm ${formatVND(Number(promotion.discountValue))}`}
          </span>
        </div>

        <p className="mt-1 text-xs text-ink/60 line-clamp-2">
          {promotion.description || "Chương trình áp dụng cho các sản phẩm tuyển chọn."}
        </p>

        <div className="mt-4 pt-3 border-t border-ink/5 space-y-1.5 text-xs text-ink/70">
          <div className="flex items-center justify-between">
            <span className="text-ink/50">Sản phẩm áp dụng:</span>
            <strong className="text-ink">{productCount === 0 ? "Tất cả" : `${productCount} sản phẩm`}</strong>
          </div>

          {(promotion.startDate || promotion.endDate) && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-ink/50">Thời hạn:</span>
              <span>
                {formatDate(promotion.startDate, "Bắt đầu")}
                {" → "}
                {formatDate(promotion.endDate, "Không giới hạn")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between pt-3 border-t border-ink/10">
        <button type="button" onClick={onToggleActive} className="text-xs font-semibold text-ink/70 hover:text-ink underline">
          {promotion.isActive ? "Tạm dừng" : "Kích hoạt"}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-ink/50 hover:bg-ink/5 hover:text-ink transition-colors"
            title="Chỉnh sửa"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
            title="Xóa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

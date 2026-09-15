"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Plus, Tag } from "@/components/admin/Icons";
import { Pagination } from "@/components/admin/Pagination";
import type { PromotionItem, PromotionProductOption } from "@/interfaces/promotion";
import { PromotionCard } from "./PromotionCard";
import { PromotionFormModal } from "./PromotionFormModal";

interface PromotionsManagerProps {
  initialPromotions: PromotionItem[];
  products: PromotionProductOption[];
  total: number;
  page: number;
  pageSize: number;
}

/** Promotions grid with pause/activate and delete; create and edit open PromotionFormModal. */
export const PromotionsManager = ({ initialPromotions, products, total, page, pageSize }: PromotionsManagerProps) => {
  const router = useRouter();
  const [promotions, setPromotions] = useState<PromotionItem[]>(initialPromotions);
  // null = form closed; { promotion: null } = creating
  const [formTarget, setFormTarget] = useState<{ promotion: PromotionItem | null } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // router.refresh() re-renders the page with fresh promotions
  useEffect(() => {
    setPromotions(initialPromotions);
  }, [initialPromotions]);

  const setActive = (id: string, isActive: boolean) =>
    setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, isActive } : p)));

  const onToggleActive = async (promotion: PromotionItem) => {
    const isNextActive = !promotion.isActive;
    setActive(promotion.id, isNextActive);
    try {
      await adminFetch(`/api/admin/promotions/${promotion.id}`, { method: "PATCH", body: { isActive: isNextActive } });
      toast.success(isNextActive ? "Đã kích hoạt chương trình!" : "Đã tạm dừng chương trình!");
      router.refresh();
    } catch {
      setActive(promotion.id, promotion.isActive);
      toast.error("Không thể cập nhật trạng thái chương trình.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chương trình giảm giá này?")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã xóa chương trình thành công!");
      router.refresh();
    } catch {
      toast.error("Không thể xóa chương trình.");
    } finally {
      setDeletingId(null);
    }
  };

  const onSaved = () => {
    setFormTarget(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold uppercase text-ink">Danh Sách Chương Trình ({total})</h2>
          <p className="text-xs text-ink/60 mt-0.5">Tạo và quản lý các đợt giảm giá, khuyến mãi đồng bộ trên toàn hệ thống</p>
        </div>
        <Button type="button" onClick={() => setFormTarget({ promotion: null })} className="flex items-center gap-2 bg-brand-forest text-white">
          <Plus size={16} />
          <span>Tạo Chương Trình Mới</span>
        </Button>
      </div>

      {promotions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/15 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest mb-4">
            <Tag size={24} />
          </div>
          <h3 className="font-display font-bold uppercase text-sm text-ink">Chưa có chương trình giảm giá nào</h3>
          <p className="text-xs text-ink/60 mt-1 max-w-sm mx-auto">
            Hãy tạo chương trình giảm giá đầu tiên để áp dụng ưu đãi và thu hút khách hàng!
          </p>
          <Button type="button" onClick={() => setFormTarget({ promotion: null })} className="mt-5 bg-brand-forest text-white">
            Tạo Chương Trình Ngay
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              isDeleting={deletingId === promotion.id}
              onToggleActive={() => onToggleActive(promotion)}
              onEdit={() => setFormTarget({ promotion })}
              onDelete={() => onDelete(promotion.id)}
            />
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="rounded-3xl border border-ink/10 bg-white p-4">
          <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/promotions" />
        </div>
      )}

      {formTarget && (
        <PromotionFormModal
          key={formTarget.promotion?.id ?? "new"}
          promotion={formTarget.promotion}
          products={products}
          onClose={() => setFormTarget(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
};

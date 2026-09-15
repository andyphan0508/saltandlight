"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { ExternalLink, Plus, Sparkles } from "@/components/admin/Icons";
import { Pagination } from "@/components/admin/Pagination";
import { getStorefrontUrl } from "@/helpers/site-url";
import type { BannerItem } from "@/interfaces/banner";
import { BannerCard } from "./BannerCard";
import { BannerFormModal } from "./BannerFormModal";

interface BannerManagerProps {
  initialBanners: BannerItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** Homepage slider banners: grid with on/off toggle and delete; create and edit open BannerFormModal. */
export const BannerManager = ({ initialBanners, total, page, pageSize }: BannerManagerProps) => {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  // null = form closed; { banner: null } = creating
  const [formTarget, setFormTarget] = useState<{ banner: BannerItem | null } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // router.refresh() re-renders the page with fresh banners
  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  const setActive = (id: string, isActive: boolean) =>
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive } : b)));

  const onToggleActive = async (banner: BannerItem) => {
    const isNextActive = !banner.isActive;
    setActive(banner.id, isNextActive);
    try {
      await adminFetch(`/api/admin/banners/${banner.id}`, { method: "PATCH", body: { isActive: isNextActive } });
      toast.success(isNextActive ? "Đã bật hiển thị banner trên trang chủ!" : "Đã tắt hiển thị banner!");
      router.refresh();
    } catch {
      setActive(banner.id, banner.isActive);
      toast.error("Không thể cập nhật trạng thái banner. Vui lòng thử lại!");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa banner này?")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Đã xóa banner thành công!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const onSaved = (saved: BannerItem) => {
    setBanners((prev) =>
      prev.some((b) => b.id === saved.id)
        ? prev.map((b) => (b.id === saved.id ? { ...b, ...saved } : b))
        : [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder),
    );
    setFormTarget(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            Cấu hình Slider & Banner Trang Chủ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các slide banner tràn màn hình hiển thị ở vị trí trang trọng nhất trên Website Salt &amp; Light.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href={getStorefrontUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
          >
            <ExternalLink size={14} />
            Xem Website
          </a>
          <Button
            onClick={() => setFormTarget({ banner: null })}
            className="inline-flex items-center gap-1.5 !bg-brand-forest hover:!bg-brand-forest/90 !text-white text-xs font-bold rounded-xl px-4 py-2 shadow-xs"
          >
            <Plus size={16} />
            Thêm Banner Mới
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <BannerCard
            key={banner.id}
            banner={banner}
            isDeleting={deletingId === banner.id}
            onToggleActive={() => onToggleActive(banner)}
            onEdit={() => setFormTarget({ banner })}
            onDelete={() => onDelete(banner.id)}
          />
        ))}

        {banners.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Sparkles size={32} className="mx-auto text-slate-300 mb-2" />
            <div className="text-sm font-bold text-slate-700">Chưa có banner nào</div>
            <p className="text-xs text-slate-400 mt-1">Bấm nút &quot;Thêm Banner Mới&quot; để tạo slide đầu tiên cho trang chủ.</p>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-4">
          <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/banners" />
        </div>
      )}

      {formTarget && (
        <BannerFormModal
          key={formTarget.banner?.id ?? "new"}
          banner={formTarget.banner}
          nextSortOrder={banners.length}
          onClose={() => setFormTarget(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
};

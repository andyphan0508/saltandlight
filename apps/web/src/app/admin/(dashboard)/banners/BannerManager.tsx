"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import {
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  Upload,
  X,
  ExternalLink,
  Check,
  Eye,
} from "@/components/admin/Icons";
import { toast } from "sonner";
import { SITE_URL, getStorefrontUrl } from "@/lib/admin/site-url";
import { BannerCropModal } from "@/components/admin/BannerCropModal";

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  bgGradient: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const GRADIENT_PRESETS = [
  { label: "Rừng & Ngọc lục bảo (Mặc định)", value: "from-brand-forest/90 via-emerald-800/80 to-slate-950" },
  { label: "Biển sâu huyền bí (Deep Teal)", value: "from-teal-900/90 via-cyan-950/85 to-slate-950" },
  { label: "Đêm tĩnh lặng (Midnight Navy)", value: "from-blue-950/90 via-slate-900/85 to-zinc-950" },
  { label: "Ấm áp & Sang trọng (Amber Sunset)", value: "from-amber-950/90 via-stone-900/85 to-zinc-950" },
  { label: "Than đá & Đen tuyền (Charcoal Minimal)", value: "from-slate-900/90 via-zinc-900/85 to-black" },
];

const DEFAULT_GRADIENT = "from-brand-forest/90 via-emerald-800/80 to-slate-950";

export function BannerManager({ initialBanners }: { initialBanners: BannerItem[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Banner Crop modal states
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("Bộ Sưu Tập Nổi Bật");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("/products");
  const [bgGradient, setBgGradient] = useState(DEFAULT_GRADIENT);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  function openCreateModal() {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setBadge("Bộ Sưu Tập Nổi Bật");
    setImageUrl("");
    setLinkUrl("/products");
    setBgGradient(DEFAULT_GRADIENT);
    setSortOrder(banners.length);
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(banner: BannerItem) {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle ?? "");
    setBadge(banner.badge ?? "Bộ Sưu Tập Nổi Bật");
    setImageUrl(banner.imageUrl ?? "");
    setLinkUrl(banner.linkUrl ?? "/products");
    setBgGradient(banner.bgGradient ?? DEFAULT_GRADIENT);
    setSortOrder(banner.sortOrder);
    setIsActive(banner.isActive);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleToggleActive(banner: BannerItem) {
    const nextActive = !banner.isActive;
    // Optimistic update
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: nextActive } : b)),
    );

    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      toast.success(nextActive ? "Đã bật hiển thị banner trên trang chủ!" : "Đã tắt hiển thị banner!");
      router.refresh();
    } catch {
      // Revert on error
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b)),
      );
      toast.error("Không thể cập nhật trạng thái banner. Vui lòng thử lại!");
    }
  }

  // When user selects a file, open Crop & Scale modal
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    setIsCropOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // When user finishes cropping and scaling
  async function handleCropComplete(croppedFile: File) {
    setIsCropOpen(false);
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", croppedFile);

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
      setImageUrl(data.url);
      toast.success("Cắt ảnh và tải banner thành công!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tải ảnh thất bại";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề banner");
      return;
    }
    if (!imageUrl.trim()) {
      setError("Vui lòng chọn hoặc nhập đường dẫn ảnh");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      badge: badge.trim() || null,
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim() || "/products",
      bgGradient,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };

    try {
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : "/api/admin/banners";
      const method = editingBanner ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu banner thất bại");

      if (editingBanner) {
        setBanners((prev) =>
          prev.map((b) => (b.id === editingBanner.id ? { ...b, ...data.banner } : b)),
        );
      } else {
        setBanners((prev) => [...prev, data.banner].sort((a, b) => a.sortOrder - b.sortOrder));
      }

      setIsModalOpen(false);
      toast.success(editingBanner ? "Cập nhật banner thành công!" : "Tạo banner mới thành công!");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa banner này?")) return;

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa banner thất bại");
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Đã xóa banner thành công!");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xóa thất bại";
      toast.error(msg);
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header action bar */}
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
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 !bg-brand-forest hover:!bg-brand-forest/90 !text-white text-xs font-bold rounded-xl px-4 py-2 shadow-xs"
          >
            <Plus size={16} />
            Thêm Banner Mới
          </Button>
        </div>
      </div>

      {/* Banner list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => (
          <div
            key={b.id}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 bg-white ${
              b.isActive ? "border-slate-200 shadow-xs hover:border-brand-forest/40 hover:shadow-md" : "border-slate-200/60 opacity-60 bg-slate-50/50"
            }`}
          >
            {/* Visual thumbnail card preview */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              {b.imageUrl ? (
                <Image
                  src={b.imageUrl}
                  alt={b.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-500 text-xs font-medium">
                  Chưa có ảnh
                </div>
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${
                  b.bgGradient || "from-slate-950/90 via-slate-950/40 to-transparent"
                } opacity-80`}
              />

              {/* Badges on preview */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                  <Sparkles size={11} className="text-amber-300" />
                  {b.badge || "Slide"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-md text-slate-200 border border-white/10">
                  Vị trí #{b.sortOrder}
                </span>
              </div>

              {/* Status pill right */}
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={() => handleToggleActive(b)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md transition-all ${
                    b.isActive
                      ? "bg-emerald-500/90 hover:bg-emerald-600 text-white"
                      : "bg-slate-700/90 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${b.isActive ? "bg-white animate-pulse" : "bg-slate-400"}`} />
                  {b.isActive ? "Đang phát" : "Tắt"}
                </button>
              </div>

              {/* Content overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-base font-black text-white leading-tight drop-shadow-sm line-clamp-1">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="text-xs text-white/80 line-clamp-1 mt-0.5 drop-shadow-sm font-medium">
                    {b.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom info & actions */}
            <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
              <div className="min-w-0 pr-2">
                <div className="text-[11px] text-slate-400 truncate">
                  Liên kết: <span className="font-mono text-slate-700">{b.linkUrl || "/products"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(b)}
                  className="p-2 rounded-xl text-slate-600 hover:text-brand-forest hover:bg-mint-50 transition-colors"
                  title="Chỉnh sửa"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  disabled={isDeletingId === b.id}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                  title="Xóa banner"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Sparkles size={32} className="mx-auto text-slate-300 mb-2" />
            <div className="text-sm font-bold text-slate-700">Chưa có banner nào</div>
            <p className="text-xs text-slate-400 mt-1">Bấm nút &quot;Thêm Banner Mới&quot; để tạo slide đầu tiên cho trang chủ.</p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề chính <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: ÁO THUN NGƯỜI LỚN"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề phụ (Mô tả ngắn)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="VD: Phong cách Cơ Đốc hiện đại, thông điệp đức tin sâu sắc"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Badge text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhãn huy hiệu (Badge)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Bộ Sưu Tập Nổi Bật"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
                  />
                </div>

                {/* Link URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đường dẫn khi nhấp (Link URL)
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products hoặc /collections/ao-thun"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono text-xs focus:border-brand-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* Image upload & URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hình ảnh Banner <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... hoặc tải ảnh lên"
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono focus:border-brand-forest focus:outline-none"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="shrink-0 text-xs px-3.5 py-2 rounded-xl font-medium border-slate-200 hover:bg-slate-50"
                  >
                    <Upload size={14} className="mr-1" />
                    {isUploading ? "Đang tải..." : "Tải & Cắt ảnh"}
                  </Button>
                </div>
              </div>

              {/* Gradient preset */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phối màu nền &amp; Gradient
                </label>
                <select
                  value={bgGradient}
                  onChange={(e) => setBgGradient(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-brand-forest focus:outline-none bg-white"
                >
                  {GRADIENT_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort order & Is Active */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thứ tự sắp xếp (0, 1, 2...)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-brand-forest focus:outline-none"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded accent-brand-forest"
                    />
                    Hiển thị trên Slider
                  </label>
                </div>
              </div>

              {/* Live Mini Preview */}
              {imageUrl && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Eye size={12} /> Xem trước hiển thị
                  </div>
                  <div className="relative aspect-[16/7] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                    <Image src={imageUrl} alt="preview" fill className="object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${bgGradient} opacity-80`} />
                    <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md mb-1">
                        {badge || "Bộ sưu tập"}
                      </span>
                      <h4 className="text-sm font-black leading-tight">{title || "Tiêu đề banner"}</h4>
                      {subtitle && <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">{subtitle}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="rounded-xl px-5 py-2 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
                >
                  {isSaving ? "Đang lưu..." : editingBanner ? "Cập nhật Banner" : "Tạo Banner"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Banner Crop & Scale Modal */}
      <BannerCropModal
        isOpen={isCropOpen}
        imageFile={cropFile}
        onClose={() => setIsCropOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}

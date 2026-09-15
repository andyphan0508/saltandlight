"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { uploadImage } from "@/api/upload-image";
import { Modal } from "@/components/Modal";
import { Eye, Sparkles, Upload, X } from "@/components/admin/Icons";
import type { BannerItem } from "@/interfaces/banner";
import { BannerCropModal } from "./BannerCropModal";

const GRADIENT_PRESETS = [
  { label: "Rừng & Ngọc lục bảo (Mặc định)", value: "from-brand-forest/90 via-emerald-800/80 to-slate-950" },
  { label: "Biển sâu huyền bí (Deep Teal)", value: "from-teal-900/90 via-cyan-950/85 to-slate-950" },
  { label: "Đêm tĩnh lặng (Midnight Navy)", value: "from-blue-950/90 via-slate-900/85 to-zinc-950" },
  { label: "Ấm áp & Sang trọng (Amber Sunset)", value: "from-amber-950/90 via-stone-900/85 to-zinc-950" },
  { label: "Than đá & Đen tuyền (Charcoal Minimal)", value: "from-slate-900/90 via-zinc-900/85 to-black" },
];

const DEFAULT_GRADIENT = GRADIENT_PRESETS[0]!.value;
const DEFAULT_BADGE = "Bộ Sưu Tập Nổi Bật";
// Storefront catalog route; "/products" does not exist on this site
const DEFAULT_LINK = "/san-pham";

const inputClass = "w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";

interface BannerFormModalProps {
  /** The banner to edit, or null to create one. */
  banner: BannerItem | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: (banner: BannerItem) => void;
}

/** Create/edit banner form with crop-before-upload and a live slide preview. Mounted once per open. */
export const BannerFormModal = ({ banner, nextSortOrder, onClose, onSaved }: BannerFormModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [badge, setBadge] = useState(banner?.badge ?? DEFAULT_BADGE);
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl ?? "");
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl ?? DEFAULT_LINK);
  const [bgGradient, setBgGradient] = useState(banner?.bgGradient ?? DEFAULT_GRADIENT);
  const [sortOrder, setSortOrder] = useState(banner?.sortOrder ?? nextSortOrder);
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A picked file goes through the crop & scale step before it is uploaded
  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onCropComplete = async (croppedFile: File) => {
    setCropFile(null);
    setIsUploading(true);
    setError(null);
    try {
      setImageUrl(await uploadImage(croppedFile));
      toast.success("Cắt ảnh và tải banner thành công!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tải ảnh thất bại";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
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
    try {
      const data = await adminFetch<{ banner: BannerItem }>(banner ? `/api/admin/banners/${banner.id}` : "/api/admin/banners", {
        method: banner ? "PATCH" : "POST",
        body: {
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          badge: badge.trim() || null,
          imageUrl: imageUrl.trim(),
          linkUrl: linkUrl.trim() || DEFAULT_LINK,
          bgGradient,
          sortOrder: Number(sortOrder) || 0,
          isActive,
        },
      });
      toast.success(banner ? "Cập nhật banner thành công!" : "Tạo banner mới thành công!");
      onSaved(data.banner);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        labelledBy="banner-form-title"
        className="bg-white max-w-xl rounded-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <h3 id="banner-form-title" className="font-bold text-slate-900 text-sm">
              {banner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
          )}

          <div>
            <label className={labelClass}>
              Tiêu đề chính <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: ÁO THUN NGƯỜI LỚN"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tiêu đề phụ (Mô tả ngắn)</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="VD: Phong cách Cơ Đốc hiện đại, thông điệp đức tin sâu sắc"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nhãn huy hiệu (Badge)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder={DEFAULT_BADGE}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Đường dẫn khi nhấp (Link URL)</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/san-pham hoặc /danh-muc/ao-thun-nguoi-lon"
                className={`${inputClass} font-mono text-xs`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
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
                onChange={onFileSelect}
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

          <div>
            <label className={labelClass}>Phối màu nền &amp; Gradient</label>
            <select value={bgGradient} onChange={(e) => setBgGradient(e.target.value)} className={`${inputClass} text-xs bg-white`}>
              {GRADIENT_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className={labelClass}>Thứ tự sắp xếp (0, 1, 2...)</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={`${inputClass} text-xs`}
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
                  <h4 className="text-sm font-bold leading-tight">{title || "Tiêu đề banner"}</h4>
                  {subtitle && <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">{subtitle}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold">
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded-xl px-5 py-2 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
            >
              {isSaving ? "Đang lưu..." : banner ? "Cập nhật Banner" : "Tạo Banner"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rendered after the form so it stacks on top of it */}
      <BannerCropModal
        isOpen={Boolean(cropFile)}
        imageFile={cropFile}
        onClose={() => setCropFile(null)}
        onCropComplete={onCropComplete}
      />
    </>
  );
};

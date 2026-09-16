"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImage } from "@/api/upload-image";
import { compressImage } from "@/helpers/image-compressor";
import { TextField } from "@/components/admin/form-fields";
import { Trash2 } from "@/components/admin/Icons";

interface BlockImageFieldProps {
  label: string;
  hint?: string;
  imageUrl: string;
  imageHref: string;
  onChange: (patch: { imageUrl?: string; imageHref?: string }) => void;
}

/** Upload slot for the layout presets that include an image, with its optional link. */
export const BlockImageField = ({ label, hint, imageUrl, imageHref, onChange }: BlockImageFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      onChange({ imageUrl: await uploadImage(await compressImage(file)) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}

      {imageUrl ? (
        <div className="flex items-start gap-3">
          <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Image src={imageUrl} alt="" fill sizes="160px" className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange({ imageUrl: "" })}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:border-rose-200 hover:text-rose-600 transition-colors"
          >
            <Trash2 size={13} /> Xóa ảnh
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-3 py-6 text-xs font-bold text-slate-500 hover:border-brand-forest hover:text-brand-forest transition-colors">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
            disabled={isUploading}
          />
          {isUploading ? "Đang tải ảnh lên…" : "Bấm để tải ảnh lên"}
        </label>
      )}

      <TextField
        label="Đường dẫn khi bấm vào ảnh (không bắt buộc)"
        value={imageHref}
        onChange={(v) => onChange({ imageHref: v })}
        placeholder="Ví dụ: /danh-muc/ao-thun-nguoi-lon"
      />
    </div>
  );
};

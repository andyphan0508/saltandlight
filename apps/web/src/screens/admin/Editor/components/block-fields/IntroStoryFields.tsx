"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImage } from "@/api/upload-image";
import { compressImage } from "@/helpers/image-compressor";
import { ArrayEditor, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

const choiceClass = (isSelected: boolean) =>
  `rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
    isSelected ? "border-brand-forest bg-brand-forest text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  }`;

export const IntroStoryFields = ({ content, onPatch }: BlockFieldsProps) => (
  <>
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Tông màu chữ</label>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onPatch({ palette: "warm" })} className={choiceClass(content.palette !== "forest")}>
          <span className="text-[#2096c7]">Xanh</span> · <span className="text-[#b66700]">Cam đất</span>
        </button>
        <button type="button" onClick={() => onPatch({ palette: "forest" })} className={choiceClass(content.palette === "forest")}>
          Xanh lá · Đen
        </button>
      </div>
    </div>

    <ImageSlot
      label="Logo nhỏ phía trên (không bắt buộc)"
      url={content.emblemUrl || ""}
      onChange={(emblemUrl) => onPatch({ emblemUrl })}
      isSmall
    />
    <TextField label="Dòng chữ nhỏ trên tiêu đề" value={content.eyebrow || ""} onChange={(v) => onPatch({ eyebrow: v })} />
    <TextField label="Tiêu đề" value={content.headline || ""} onChange={(v) => onPatch({ headline: v })} required />
    <TextField label="Nội dung" value={content.body || ""} onChange={(v) => onPatch({ body: v })} isMultiline />
    <ImageSlot label="Ảnh lớn phía dưới (không bắt buộc)" url={content.imageUrl || ""} onChange={(imageUrl) => onPatch({ imageUrl })} />
    <ArrayEditor
      label="Nút bấm (tối đa 4)"
      items={content.buttons || []}
      onChange={(buttons) => onPatch({ buttons: buttons.slice(0, 4) })}
      newItem={() => ({ label: "", href: "", variant: "primary" })}
      renderItem={(button, onUpdate) => (
        <div className="grid grid-cols-3 gap-2">
          <TextField label="Chữ trên nút" value={button.label || ""} onChange={(v) => onUpdate({ label: v })} required />
          <TextField label="Đường dẫn" value={button.href || ""} onChange={(v) => onUpdate({ href: v })} required />
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Kiểu dáng</label>
            <select
              value={button.variant || "primary"}
              onChange={(e) => onUpdate({ variant: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
            >
              <option value="primary">Nổi bật</option>
              <option value="outline">Viền</option>
            </select>
          </div>
        </div>
      )}
    />
  </>
);

const ImageSlot = ({
  label,
  url,
  onChange,
  isSmall = false,
}: {
  label: string;
  url: string;
  onChange: (url: string) => void;
  isSmall?: boolean;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      onChange(await uploadImage(await compressImage(file)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      {url ? (
        <div className="flex items-center gap-3">
          <div className={`relative flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 ${isSmall ? "h-16 w-16" : "h-20 w-32"}`}>
            <Image src={url} alt="" fill sizes="128px" className={isSmall ? "object-contain" : "object-cover"} />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:border-rose-200 hover:text-rose-600"
          >
            Gỡ ảnh
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-xs font-bold text-slate-500 transition-colors hover:border-brand-forest hover:text-brand-forest">
          <input type="file" accept="image/*" className="sr-only" disabled={isUploading} onChange={(e) => onFile(e.target.files?.[0])} />
          {isUploading ? "Đang tải ảnh lên…" : "Bấm để tải ảnh lên"}
        </label>
      )}
    </div>
  );
};

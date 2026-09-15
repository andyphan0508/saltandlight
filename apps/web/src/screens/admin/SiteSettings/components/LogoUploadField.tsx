"use client";

import Image from "next/image";
import { Button } from "@saltandlight/ui";
import { ImageOff, Upload } from "@/components/admin/Icons";
import { useImageUpload } from "@/hooks/use-image-upload";

interface LogoUploadFieldProps {
  label: string;
  imageUrl: string;
  onUploaded: (url: string) => void;
  onClear?: () => void;
  clearLabel?: string;
}

/** Image thumbnail with upload and optional "remove" action. */
export const LogoUploadField = ({ label, imageUrl, onUploaded, onClear, clearLabel }: LogoUploadFieldProps) => {
  const { inputRef, isUploading, onFile } = useImageUpload(onUploaded);

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
          {imageUrl ? (
            <Image src={imageUrl} alt={label} fill className="object-contain p-2" unoptimized />
          ) : (
            <ImageOff size={20} className="text-slate-300" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="text-xs px-3.5 py-2 rounded-xl font-medium border-slate-200 hover:bg-slate-50"
          >
            <Upload size={14} className="mr-1" />
            {isUploading ? "Đang tải..." : "Tải ảnh lên"}
          </Button>
          {onClear && imageUrl && (
            <button type="button" onClick={onClear} className="block text-[11px] font-semibold text-rose-500 hover:underline">
              {clearLabel ?? "Gỡ ảnh, dùng mặc định"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

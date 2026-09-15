"use client";

import Image from "next/image";
import type { ProductFormState } from "@/hooks/use-product-form";
import { Section } from "../form-fields";
import { GripVertical, ImagePlus, Trash2, Upload } from "../Icons";

/** Product image grid: drag to reorder (first image is the main one), upload several at once. */
export const ImagesSection = ({ form }: { form: ProductFormState }) => (
  <Section title="Ảnh sản phẩm" icon={<ImagePlus size={16} />} badge={`${form.images.length} ảnh`}>
    <div className="flex flex-wrap gap-3">
      {form.images.map((image, i) => (
        <div
          key={image.url}
          draggable
          onDragStart={() => form.setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => form.onDropImage(i)}
          className="group relative h-28 w-28 cursor-grab overflow-hidden rounded-xl border border-ink/10 bg-mint-50 active:cursor-grabbing"
        >
          <Image src={image.url} alt="" fill className="object-cover" />
          {i === 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
              Ảnh chính
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <GripVertical size={14} className="text-white/70" />
            <button
              type="button"
              onClick={() => form.onRemoveImage(i)}
              aria-label="Xoá ảnh"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-ink hover:bg-sale hover:text-white"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      ))}

      <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink/15 text-ink/40 transition-colors hover:border-brand-forest hover:text-brand-forest">
        {form.uploadingCount > 0 ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-[10px] font-semibold">Đang tải {form.uploadingCount}…</span>
          </>
        ) : (
          <>
            <Upload size={18} />
            <span className="text-[10px] font-semibold">Thêm ảnh</span>
          </>
        )}
        <input
          ref={form.fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={form.onFilesChange}
          className="hidden"
        />
      </label>
    </div>
    <p className="mt-3 text-xs text-ink/50">
      💡 Ảnh tải lên được hệ thống <strong>tự động nén tối ưu (200kb - 500kb WebP)</strong>, giữ chất lượng ảnh sắc nét mà
      tải siêu nhanh. Kéo-thả để đổi vị trí.
    </p>
  </Section>
);

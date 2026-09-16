"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImage } from "@/api/upload-image";
import { compressImage } from "@/helpers/image-compressor";
import {
  INTERVAL_CHOICES,
  MEDIA_EFFECTS,
  readBlockMedia,
  type MediaEffect,
  type MediaSlide,
} from "@/helpers/product-block-media";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "@/components/admin/Icons";

interface BlockMediaFieldProps {
  hint: string;
  content: Record<string, any>;
  onPatch: (patch: Record<string, any>) => void;
}

const toggleClass = (isOn: boolean) =>
  `rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all ${
    isOn ? "border-brand-forest bg-brand-forest text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
  }`;

/** Editor for a preset's media cell: which images fill it and how they move. */
export const BlockMediaField = ({ hint, content, onPatch }: BlockMediaFieldProps) => {
  const media = readBlockMedia(content);
  const [isUploading, setIsUploading] = useState(false);
  // The saved effect, not the one readBlockMedia degraded to while there is 1 image
  const savedEffect = (content.media?.effect as MediaEffect) || "none";

  const patchMedia = (patch: Record<string, unknown>) =>
    onPatch({
      media: {
        slides: media.slides,
        effect: savedEffect,
        isAutoplay: content.media?.isAutoplay ?? false,
        intervalMs: media.intervalMs,
        hasDots: content.media?.hasDots ?? true,
        hasArrows: content.media?.hasArrows ?? true,
        ...patch,
      },
      // Mirror the first slide so any older reader still sees an image
      imageUrl: (patch.slides as MediaSlide[] | undefined)?.[0]?.url ?? media.slides[0]?.url ?? "",
    });

  const setSlides = (slides: MediaSlide[]) => patchMedia({ slides });

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    const uploaded: MediaSlide[] = [];
    for (const file of Array.from(files)) {
      try {
        uploaded.push({ url: await uploadImage(await compressImage(file)), href: "", alt: "" });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Tải ảnh thất bại");
      }
    }
    if (uploaded.length) setSlides([...media.slides, ...uploaded]);
    setIsUploading(false);
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= media.slides.length) return;
    const next = [...media.slides];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    setSlides(next);
  };

  const isEffectPending = savedEffect !== "none" && media.slides.length < 2;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Ô hình ảnh của bố cục</label>
        <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      </div>

      {/* 1. What the cell does */}
      <div className="grid grid-cols-2 gap-2">
        {MEDIA_EFFECTS.map((option) => {
          const isSelected = savedEffect === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => patchMedia({ effect: option.id })}
              aria-pressed={isSelected}
              className={`rounded-xl border p-2.5 text-left transition-all ${
                isSelected
                  ? "border-brand-forest bg-white shadow-xs ring-2 ring-brand-forest/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <EffectThumbnail effect={option.id} />
              <span className="mt-1.5 block text-xs font-bold text-slate-800">{option.label}</span>
              <span className="block text-[11px] leading-snug text-slate-500">{option.hint}</span>
            </button>
          );
        })}
      </div>

      {isEffectPending && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-semibold text-amber-800">
          Hiệu ứng cần ít nhất 2 ảnh. Hiện chỉ có {media.slides.length} — khối vẫn hiển thị ảnh tĩnh cho tới khi bạn thêm ảnh.
        </p>
      )}

      {/* 2. The images themselves */}
      <div className="space-y-2">
        {media.slides.map((slide, i) => (
          <div key={`${slide.url}-${i}`} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2">
            <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <Image src={slide.url} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <input
              value={slide.href || ""}
              onChange={(e) =>
                setSlides(media.slides.map((s, j) => (j === i ? { ...s, href: e.target.value } : s)))
              }
              placeholder="Đường dẫn khi bấm vào ảnh (không bắt buộc)"
              aria-label={`Đường dẫn của ảnh ${i + 1}`}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-brand-forest focus:outline-none"
            />
            <div className="flex flex-shrink-0 items-center">
              <IconButton label={`Đưa ảnh ${i + 1} lên trước`} onClick={() => moveSlide(i, i - 1)} isDisabled={i === 0}>
                <ChevronLeft size={14} />
              </IconButton>
              <IconButton
                label={`Đưa ảnh ${i + 1} ra sau`}
                onClick={() => moveSlide(i, i + 1)}
                isDisabled={i === media.slides.length - 1}
              >
                <ChevronRight size={14} />
              </IconButton>
              <IconButton label={`Xóa ảnh ${i + 1}`} onClick={() => setSlides(media.slides.filter((_, j) => j !== i))}>
                <Trash2 size={14} />
              </IconButton>
            </div>
          </div>
        ))}

        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-xs font-bold text-slate-500 hover:border-brand-forest hover:text-brand-forest transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => onUpload(e.target.files)}
            disabled={isUploading}
          />
          <Plus size={14} />
          {isUploading ? "Đang tải ảnh lên…" : media.slides.length ? "Thêm ảnh vào băng" : "Bấm để tải ảnh lên"}
        </label>
      </div>

      {/* 3. How it moves — only once an effect can actually run */}
      {media.effect !== "none" && (
        <div className="space-y-2.5 border-t border-slate-200/80 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => patchMedia({ isAutoplay: !media.isAutoplay })}
              aria-pressed={media.isAutoplay}
              className={toggleClass(media.isAutoplay)}
            >
              Tự động chạy
            </button>
            <button
              type="button"
              onClick={() => patchMedia({ hasArrows: !media.hasArrows })}
              aria-pressed={media.hasArrows}
              className={toggleClass(media.hasArrows)}
            >
              Mũi tên hai bên
            </button>
            <button
              type="button"
              onClick={() => patchMedia({ hasDots: !media.hasDots })}
              aria-pressed={media.hasDots}
              className={toggleClass(media.hasDots)}
            >
              Chấm chỉ số ảnh
            </button>
          </div>

          {media.isAutoplay && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-slate-700">Mỗi ảnh dừng bao lâu</label>
              <div className="grid grid-cols-5 gap-2">
                {INTERVAL_CHOICES.map((ms) => (
                  <button
                    key={ms}
                    type="button"
                    onClick={() => patchMedia({ intervalMs: ms })}
                    className={toggleClass(media.intervalMs === ms)}
                  >
                    {ms / 1000}s
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Băng ảnh tự dừng khi khách rê chuột vào, và không tự chạy với khách đã bật chế độ hạn chế chuyển động.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const IconButton = ({
  label,
  onClick,
  isDisabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled}
    aria-label={label}
    title={label}
    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
  >
    {children}
  </button>
);

const BAR = "rounded-[2px] bg-brand-forest/70";

/** Wireframe of what each effect does, so the choice is visual rather than verbal. */
const EffectThumbnail = ({ effect }: { effect: MediaEffect }) => (
  <div aria-hidden="true" className="flex h-9 w-full items-center gap-1 overflow-hidden rounded-lg bg-slate-100 p-1.5">
    {effect === "none" && <div className={`${BAR} h-full w-full`} />}
    {effect === "fade" && (
      <div className="relative h-full w-full">
        <div className={`${BAR} absolute inset-0 opacity-40`} />
        <div className={`${BAR} absolute inset-0 opacity-95`} />
      </div>
    )}
    {effect === "slide" && (
      <>
        <div className={`${BAR} h-full w-[85%] flex-shrink-0`} />
        <div className={`${BAR} h-full w-[30%] flex-shrink-0 opacity-40`} />
      </>
    )}
    {effect === "carousel" && (
      <>
        <div className={`${BAR} h-full w-[45%] flex-shrink-0`} />
        <div className={`${BAR} h-full w-[45%] flex-shrink-0`} />
        <div className={`${BAR} h-full w-[25%] flex-shrink-0 opacity-40`} />
      </>
    )}
  </div>
);

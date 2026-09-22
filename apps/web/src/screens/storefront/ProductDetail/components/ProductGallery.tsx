"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Sparkles, ZoomIn } from "@/components/Icons";
import { ImageLightboxModal } from "./ImageLightboxModal";

interface ProductGalleryProps {
  images: { url: string }[];
  productName: string;
}

export const ProductGallery = ({
  images,
  productName,
}: ProductGalleryProps) => {
  const [active, setActive] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const onOpenLightbox = () => {
    setIsLightboxOpen(true);
  };

  const onCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Swiping the main image moves between photos; the thumbnails follow along
  const onTrackScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== active) setActive(index);
  };

  const onSelectImage = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: index * track.clientWidth, behavior: isReduced ? "auto" : "smooth" });
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 max-w-md mx-auto w-full">
      {/* Main Image Container - Scaled to ~1/3 viewport height on mobile, compact on desktop */}
      <div
        className="relative h-[34vh] min-h-[260px] max-h-[320px] sm:h-[380px] sm:max-h-[420px] w-full overflow-hidden rounded-3xl bg-white border border-ink/5 shadow-card group cursor-zoom-in"
        onClick={onOpenLightbox}
      >
        {images.length > 0 ? (
          <div
            ref={trackRef}
            data-product-gallery
            onScroll={onTrackScroll}
            className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          >
            {images.map((img, i) => (
              <div key={img.url + i} className="relative h-full w-full flex-shrink-0 snap-center snap-always">
                <Image
                  src={img.url}
                  alt={i === 0 ? productName : `${productName} — ảnh ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 400px, 90vw"
                  className="object-contain p-2 sm:p-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  priority={i === 0}
                  // The shared-element target for the card → product page transition
                  style={i === 0 ? { viewTransitionName: "product-hero" } : undefined}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-mint-50 text-ink/30 p-8 text-center">
            <Sparkles size={32} className="text-mint-300 mb-2" />
            <span className="font-display font-bold uppercase tracking-wider text-sm">Salt &amp; Light</span>
            <span className="text-xs mt-1">Faith &amp; Apparel</span>
          </div>
        )}

        {/* 100% Ảnh Thực Tế Tag */}
        <div className="absolute left-3 bottom-3 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white select-none pointer-events-none">
          100% Ảnh Thật
        </div>

        {/* Zoom Hint Icon */}
        <button
          type="button"
          aria-label="Phóng to ảnh"
          className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink/70 shadow-md backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox();
          }}
        >
          <ZoomIn size={15} />
        </button>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 px-0.5 scrollbar-none">
          {images.map((img, i) => {
            const isActive = i === active;
            return (
              <button
                key={img.url + i}
                type="button"
                aria-label={`Xem ảnh ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelectImage(i)}
                className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                  isActive
                    ? "border-brand-forest shadow-sm scale-100 ring-2 ring-brand-forest/20"
                    : "border-ink/10 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageLightboxModal
        images={images}
        initialIndex={active}
        productName={productName}
        isOpen={isLightboxOpen}
        onClose={onCloseLightbox}
      />
    </div>
  );
};

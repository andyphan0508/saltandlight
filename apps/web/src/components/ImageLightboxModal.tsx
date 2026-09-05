"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "./Icons";

interface ImageLightboxModalProps {
  images: { url: string }[];
  initialIndex?: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightboxModal({
  images,
  initialIndex = 0,
  productName,
  isOpen,
  onClose,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
      // Lock scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialIndex]);

  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, nextImage, prevImage]);

  const current = images[currentIndex] ?? images[0];
  if (!isOpen || images.length === 0 || !current) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? 0;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    setTouchStartX(null);
  };

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.8 : 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-md text-white transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/80 to-transparent z-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70 line-clamp-1 max-w-[200px] sm:max-w-md">
            {productName}
          </span>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-white/90">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom toggle button */}
          <button
            type="button"
            onClick={toggleZoom}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white/90 transition-colors"
            title={zoomLevel === 1 ? "Phóng to" : "Thu nhỏ"}
          >
            {zoomLevel === 1 ? <ZoomIn size={18} /> : <ZoomOut size={18} />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            title="Đóng (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden px-4 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Buttons (desktop & tablet) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-3 sm:left-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-all active:scale-95"
              title="Ảnh trước (←)"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 sm:right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-all active:scale-95"
              title="Ảnh tiếp theo (→)"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* The Image */}
        <div
          className="relative max-h-[75vh] max-w-[90vw] sm:max-w-[80vw] h-[650px] w-full flex items-center justify-center transition-transform duration-300 cursor-zoom-in"
          onClick={toggleZoom}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <Image
            src={current.url}
            alt={`${productName} - ảnh ${currentIndex + 1}`}
            fill
            sizes="95vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="w-full py-4 px-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 flex justify-center">
          <div className="flex items-center gap-2.5 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
            {images.map((img, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={img.url + idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoomLevel(1);
                  }}
                  className={`relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-emerald-400 scale-105 shadow-lg opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

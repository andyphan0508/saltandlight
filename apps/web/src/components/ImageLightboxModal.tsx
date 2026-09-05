"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
      // Lock body scroll
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

  if (!mounted || !isOpen || images.length === 0) return null;

  const current = images[currentIndex] ?? images[0];
  if (!current) return null;

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
    setZoomLevel((prev) => (prev === 1 ? 1.6 : 1));
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-3 sm:p-6 bg-black/30 backdrop-blur-md text-white transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // Clicking backdrop background closes modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-2.5 rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1.5 border border-white/15 text-white/90 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider line-clamp-1 max-w-[150px] sm:max-w-md">
            {productName}
          </span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-mono font-bold text-white">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom toggle button */}
          <button
            type="button"
            onClick={toggleZoom}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 shadow-lg transition-all active:scale-95"
            title={zoomLevel === 1 ? "Phóng to" : "Thu nhỏ"}
          >
            {zoomLevel === 1 ? <ZoomIn size={18} /> : <ZoomOut size={18} />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 shadow-lg transition-all active:scale-95"
            title="Đóng (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Focus Center Stage */}
      <div
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-auto select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Buttons (desktop & tablet) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-1 sm:left-4 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/15 shadow-xl transition-all active:scale-90"
              title="Ảnh trước (←)"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-1 sm:right-4 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/15 shadow-xl transition-all active:scale-90"
              title="Ảnh tiếp theo (→)"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Center Image Container: Centered in browser viewport, scaling per device */}
        <div
          className="relative max-h-[70vh] sm:max-h-[76vh] w-[94vw] sm:w-[85vw] max-w-3xl h-full flex items-center justify-center transition-transform duration-200 cursor-zoom-in rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-2 sm:p-4"
          onClick={toggleZoom}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <Image
            src={current.url}
            alt={`${productName} - ảnh ${currentIndex + 1}`}
            fill
            sizes="(min-width: 1024px) 800px, 92vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="w-full flex justify-center z-30 pointer-events-auto">
          <div className="flex items-center gap-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 p-1.5 shadow-xl max-w-full overflow-x-auto no-scrollbar">
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
                  className={`relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-emerald-400 scale-105 shadow-md opacity-100 ring-2 ring-emerald-400/30"
                      : "border-transparent opacity-50 hover:opacity-90"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

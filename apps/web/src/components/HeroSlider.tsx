"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "./Icons";
import type { BannerData } from "@/lib/types";

const DEFAULT_SLIDES: BannerData[] = [
  {
    id: "default-1",
    title: "ÁO THUN NGƯỜI LỚN",
    subtitle: "Form Regular Fit Unisex 100% Cotton 4 chiều, in Lời Chúa sắc nét bền màu",
    badge: "BÁN CHẠY NHẤT",
    linkUrl: "/danh-muc/ao-thun",
    bgGradient: "from-brand-forest/90 via-emerald-900/80 to-slate-950",
    imageUrl: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "default-2",
    title: "ÁO THUN CHO BÉ",
    subtitle: "Cotton tự nhiên mềm mại, thoáng mát, dịu êm an toàn cho làn da nhạy cảm",
    badge: "DỄ THƯƠNG & Ý NGHĨA",
    linkUrl: "/danh-muc/ao-thun-cho-be",
    bgGradient: "from-rose-950/90 via-pink-900/80 to-slate-950",
    imageUrl: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "default-3",
    title: "TÚI TOTE CANVAS",
    subtitle: "Vải bố dệt mộc dày dặn, quai may chịu lực, in thông điệp Đức Tin đồng hành mỗi ngày",
    badge: "PHỤ KIỆN THƯỜNG NHẬT",
    linkUrl: "/danh-muc/tui-canvas",
    bgGradient: "from-amber-950/90 via-stone-900/80 to-zinc-950",
    imageUrl: null,
    sortOrder: 3,
    isActive: true,
  },
];

export function HeroSlider({ banners }: { banners?: BannerData[] }) {
  const slides = banners && banners.length > 0 ? banners : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay - slowed down to 7.5s for a calm, seamless experience
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(nextSlide, 7500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, total]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) touchStartX.current = touch.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) touchEndX.current = touch.clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none bg-slate-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-width Panoramic Widescreen Slide Viewport */}
      <div className="relative w-full h-[340px] sm:h-[440px] md:h-[500px] lg:h-[560px] xl:h-[620px]">
        {slides.map((slide, index) => {
          const isActive = index === current;
          const bgGradient = slide.bgGradient || "from-brand-forest/90 via-emerald-900/80 to-slate-950";

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Full Bleed Banner Image stretching across the entire width */}
              {slide.imageUrl ? (
                <div
                  className={`absolute inset-0 w-full h-full transform transition-transform duration-7000 ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                  {/* Subtle dark gradient overlay on left for crystal-clear readability while letting the banner shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10 sm:from-black/75 sm:via-black/35 sm:to-transparent" />
                </div>
              ) : (
                /* Fallback gradient if no image */
                <div className={`absolute inset-0 w-full h-full bg-gradient-to-r ${bgGradient}`}>
                  <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-brand-forest/20 blur-2xl pointer-events-none" />
                </div>
              )}

              {/* Foreground Typography & Call To Action */}
              <div className="relative mx-auto max-w-7xl w-full h-full px-5 sm:px-8 lg:px-12 flex flex-col justify-center items-start text-white z-10">
                {/* Badge */}
                {slide.badge && (
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white border border-white/20 mb-2.5 sm:mb-4 shadow-sm ${
                      index === current ? "animate-pop-in" : ""
                    }`}
                  >
                    <Sparkles size={13} className="text-amber-300" />
                    <span>{slide.badge}</span>
                  </div>
                )}

                {/* Big Vietnamese Headline */}
                <h2
                  className={`font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md max-w-2xl ${
                    index === current ? "animate-slide-up-fade" : ""
                  }`}
                >
                  {slide.title}
                </h2>

                {/* Subtitle */}
                {slide.subtitle && (
                  <p
                    className={`mt-2 sm:mt-3 text-xs sm:text-base lg:text-lg text-white/90 max-w-xl leading-relaxed drop-shadow-sm font-medium ${
                      index === current ? "animate-slide-up-fade" : ""
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                )}

                {/* CTA Buttons */}
                <div
                  className={`mt-5 sm:mt-8 flex flex-wrap items-center gap-3 ${
                    index === current ? "animate-slide-up-fade" : ""
                  }`}
                >
                  <Link
                    href={slide.linkUrl || "/san-pham"}
                    className="inline-flex items-center gap-2.5 rounded-full bg-white text-ink px-6 py-3 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl hover:bg-mint-100 hover:scale-105 transition-all duration-300 active-press group"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/san-pham"
                    className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold tracking-wide border border-white/25 transition-all active-press"
                  >
                    <span>Xem tất cả</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide trước"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white shadow-lg backdrop-blur-md border border-white/15 transition-all active:scale-90"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide tiếp theo"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white shadow-lg backdrop-blur-md border border-white/15 transition-all active:scale-90"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Pagination Dots Indicator */}
      {total > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Đi tới slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current ? "w-7 bg-white shadow-sm" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

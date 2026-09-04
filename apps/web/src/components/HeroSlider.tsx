"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "./Icons";
import type { BannerData } from "@/lib/types";

const DEFAULT_SLIDES: BannerData[] = [
  {
    id: "default-1",
    title: "Áo Thun Người Lớn",
    subtitle: "Form Regular Fit Unisex 100% Cotton 4 chiều, in Lời Chúa sắc nét bền màu",
    badge: "BÁN CHẠY NHẤT",
    linkUrl: "/danh-muc/ao-thun",
    bgGradient: "from-[#d8edd9] via-[#eaf5eb] to-[#faf9f6]",
    imageUrl: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "default-2",
    title: "Áo Thun Cho Bé",
    subtitle: "Cotton tự nhiên mềm mại, thoáng mát, dịu êm an toàn cho làn da nhạy cảm",
    badge: "DỄ THƯƠNG & Ý NGHĨA",
    linkUrl: "/danh-muc/ao-thun-cho-be",
    bgGradient: "from-[#fde2e4] via-[#fff1f2] to-[#faf9f6]",
    imageUrl: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "default-3",
    title: "Túi Tote Canvas",
    subtitle: "Vải bố dệt mộc dày dặn, quai may chịu lực, in thông điệp Đức Tin đồng hành mỗi ngày",
    badge: "PHỤ KIỆN THƯỜNG NHẬT",
    linkUrl: "/danh-muc/tui-canvas",
    bgGradient: "from-[#fef3c7] via-[#fffbeb] to-[#faf9f6]",
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

  // Autoplay
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(nextSlide, 5500);
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
      className="relative w-full overflow-hidden select-none bg-cream"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Viewport */}
      <div className="relative w-full min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] flex items-center">
        {slides.map((slide, index) => {
          const isActive = index === current;
          const bgGradient = slide.bgGradient || "from-[#e6f2e8] via-[#f4f9f5] to-[#faf9f6]";

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full flex items-center transition-all duration-700 ease-out bg-gradient-to-r ${bgGradient} ${
                isActive
                  ? "opacity-100 translate-x-0 z-10 pointer-events-auto"
                  : "opacity-0 translate-x-8 z-0 pointer-events-none"
              }`}
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-white/40 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-brand-forest/5 blur-2xl pointer-events-none" />

              <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid lg:grid-cols-12 items-center gap-8 lg:gap-12">
                  {/* Left Content */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
                    {/* Badge */}
                    {slide.badge && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-ink shadow-sm border border-ink/5">
                        <Sparkles size={13} className="text-brand-forest" />
                        <span>{slide.badge}</span>
                      </div>
                    )}

                    {/* Big Bold Vietnamese Typography */}
                    <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-ink leading-[1.1]">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    {slide.subtitle && (
                      <p className="text-sm sm:text-base lg:text-lg text-ink/75 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* CTA Button */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                      <Link
                        href={slide.linkUrl || "/san-pham"}
                        className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-md hover:bg-brand-forest hover:shadow-lg transition-all duration-200 active:scale-95 group"
                      >
                        <span>Khám phá ngay</span>
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link
                        href="/san-pham"
                        className="inline-flex items-center gap-2 rounded-full bg-white/80 hover:bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-ink transition-all border border-ink/10"
                      >
                        <span>Xem tất cả sản phẩm</span>
                      </Link>
                    </div>
                  </div>

                  {/* Right Showcase Visual */}
                  <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
                    <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl bg-white/70 backdrop-blur-md p-6 shadow-card border border-white/60 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-card-hover transition-all">
                      {slide.imageUrl ? (
                        <div className="relative w-full h-full overflow-hidden rounded-2xl">
                          <Image
                            src={slide.imageUrl}
                            alt={slide.title}
                            fill
                            priority
                            className="object-cover rounded-2xl"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-mint-100 flex items-center justify-center text-brand-forest">
                            <Sparkles size={32} />
                          </div>
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-brand-forest block">
                              Bộ sưu tập cao cấp
                            </span>
                            <h3 className="font-display text-xl font-black uppercase text-ink mt-1">
                              {slide.title}
                            </h3>
                            <p className="text-xs text-ink/60 mt-1">100% Cotton • Chuẩn form Unisex</p>
                          </div>
                          <span className="inline-block rounded-full bg-ink/5 px-3 py-1 text-[11px] font-bold text-ink/70">
                            Đồng giá ship 19K toàn quốc
                          </span>
                        </>
                      )}
                    </div>
                  </div>
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
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/80 hover:bg-white text-ink shadow-md backdrop-blur border border-ink/5 transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide tiếp theo"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/80 hover:bg-white text-ink shadow-md backdrop-blur border border-ink/5 transition-all active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Slide Indicators Dots & Progress */}
      {total > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              aria-label={`Đi tới slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === current
                  ? "w-8 h-2.5 bg-ink"
                  : "w-2.5 h-2.5 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "@/components/Icons";
import type { BlockMedia, MediaSlide } from "@/helpers/product-block-media";

const DRAG_THRESHOLD = 8;

/**
 * The layout preset's media cell: one fixed image, or a slideshow in the effect
 * the admin chose. Auto-rotation always ships with prev/next and a pause
 * control, stops on hover or keyboard focus, and never starts when the visitor
 * asked for reduced motion.
 */
export const MediaSlideshow = ({
  media,
  className,
  fallbackAlt,
}: {
  media: BlockMedia;
  className: string;
  fallbackAlt: string;
}) => {
  const { slides, effect, isAutoplay, intervalMs, hasDots, hasArrows } = media;
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMotionReduced, setIsMotionReduced] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ isDown: false, startX: 0, startScroll: 0, distance: 0 });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setIsMotionReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const total = slides.length;
      if (total === 0) return;
      const wrapped = ((next % total) + total) % total;
      setIndex(wrapped);
      if (effect === "carousel") {
        const child = railRef.current?.children[wrapped] as HTMLElement | undefined;
        child?.scrollIntoView({ behavior: isMotionReduced ? "auto" : "smooth", block: "nearest", inline: "start" });
      }
    },
    [slides.length, effect, isMotionReduced],
  );

  const isRunning = isAutoplay && !isPaused && !isMotionReduced && slides.length > 1;

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => goTo(index + 1), intervalMs);
    return () => clearInterval(timer);
  }, [isRunning, intervalMs, index, goTo]);

  // Mouse drag for the carousel; touch keeps native momentum scrolling
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !railRef.current) return;
    drag.current = { isDown: true, startX: e.clientX, startScroll: railRef.current.scrollLeft, distance: 0 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.isDown || !railRef.current) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.distance = Math.abs(delta);
    railRef.current.scrollLeft = drag.current.startScroll - delta;
  };
  const onPointerUp = () => {
    drag.current.isDown = false;
  };
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.distance > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
    drag.current.distance = 0;
  };

  if (slides.length === 0) return null;

  const motionClass = isMotionReduced ? "transition-none" : "";

  return (
    <div
      className={`group/media relative overflow-hidden rounded-2xl bg-mint-50 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      {...(effect === "none"
        ? {}
        : { role: "group", "aria-roledescription": "băng ảnh", "aria-label": fallbackAlt })}
    >
      {effect === "none" && <Slide slide={slides[0]!} fallbackAlt={fallbackAlt} isPriority />}

      {effect === "fade" &&
        slides.map((slide, i) => (
          <div
            key={`${slide.url}-${i}`}
            aria-hidden={i !== index}
            className={`absolute inset-0 duration-700 ease-out ${motionClass} ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            } transition-opacity`}
          >
            <Slide slide={slide} fallbackAlt={fallbackAlt} isPriority={i === 0} />
          </div>
        ))}

      {effect === "slide" && (
        <div
          className={`flex h-full w-full transition-transform duration-500 ease-out ${motionClass}`}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={`${slide.url}-${i}`} className="relative h-full w-full flex-shrink-0">
              <Slide slide={slide} fallbackAlt={fallbackAlt} isPriority={i === 0} />
            </div>
          ))}
        </div>
      )}

      {effect === "carousel" && (
        <div
          ref={railRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClickCapture={onClickCapture}
          className="flex h-full w-full cursor-grab snap-x snap-proximity select-none gap-2 overflow-x-auto no-scrollbar active:cursor-grabbing"
        >
          {slides.map((slide, i) => (
            <div
              key={`${slide.url}-${i}`}
              className="relative h-full w-[72%] flex-shrink-0 snap-start overflow-hidden rounded-xl sm:w-[48%]"
            >
              <Slide slide={slide} fallbackAlt={fallbackAlt} isPriority={i === 0} />
            </div>
          ))}
        </div>
      )}

      {hasArrows && slides.length > 1 && (
        <>
          <ControlButton label="Ảnh trước" onClick={() => goTo(index - 1)} className="left-2">
            <ChevronLeft size={18} />
          </ControlButton>
          <ControlButton label="Ảnh tiếp theo" onClick={() => goTo(index + 1)} className="right-2">
            <ChevronRight size={18} />
          </ControlButton>
        </>
      )}

      {(hasDots || isAutoplay) && slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-2">
          {isAutoplay && (
            <button
              type="button"
              onClick={() => setIsPaused((paused) => !paused)}
              aria-pressed={isPaused}
              aria-label={isPaused ? "Chạy lại băng ảnh" : "Tạm dừng băng ảnh"}
              className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-ink shadow-sm backdrop-blur"
            >
              {isPaused || isMotionReduced ? "▶" : "❚❚"}
            </button>
          )}
          {hasDots &&
            slides.map((slide, i) => (
              <button
                key={`dot-${slide.url}-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Xem ảnh ${i + 1} trên ${slides.length}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/90"
                } shadow-sm`}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const Slide = ({ slide, fallbackAlt, isPriority }: { slide: MediaSlide; fallbackAlt: string; isPriority: boolean }) => {
  const image = (
    <Image
      src={slide.url}
      alt={slide.alt || fallbackAlt}
      fill
      sizes="(min-width: 1024px) 50vw, 100vw"
      priority={isPriority}
      className="object-cover"
      draggable={false}
    />
  );

  return slide.href ? (
    <Link href={slide.href} className="absolute inset-0 block">
      {image}
    </Link>
  ) : (
    image
  );
};

const ControlButton = ({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-white/90 text-ink shadow-lg backdrop-blur transition-opacity hover:bg-white focus-visible:opacity-100 lg:opacity-0 lg:group-hover/media:opacity-100 ${className}`}
  >
    {children}
  </button>
);

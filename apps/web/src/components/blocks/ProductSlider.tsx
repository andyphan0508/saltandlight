"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ChevronLeft, ChevronRight } from "@/components/Icons";
import type { ProductCardData } from "@/interfaces/catalog";

const DRAG_THRESHOLD = 8;

export const ProductSlider = ({ products, isCompact = false }: { products: ProductCardData[]; isCompact?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ isDown: false, startX: 0, startScroll: 0, distance: 0 });

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Mouse only — touch already scrolls the rail natively, and hijacking it
  // would break momentum scrolling on phones.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !scrollRef.current) return;
    drag.current = { isDown: true, startX: e.clientX, startScroll: scrollRef.current.scrollLeft, distance: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.isDown || !scrollRef.current) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.distance = Math.abs(delta);
    scrollRef.current.scrollLeft = drag.current.startScroll - delta;
  };

  const onPointerUp = () => {
    drag.current.isDown = false;
  };

  // A drag that ends on a product card must not open that product
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.distance > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
    drag.current.distance = 0;
  };

  return (
    <div className="relative group/slider">
      {/* Left Navigation Arrow (Desktop) */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Cuộn sang trái"
        className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-xl border border-ink/10 opacity-0 group-hover/slider:opacity-100 transition-all hover:scale-110 active-press"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Right Navigation Arrow (Desktop) */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Cuộn sang phải"
        className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-xl border border-ink/10 opacity-0 group-hover/slider:opacity-100 transition-all hover:scale-110 active-press"
      >
        <ChevronRight size={20} />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
        className="flex gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-proximity py-3 px-1 cursor-grab active:cursor-grabbing select-none"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className={`flex-shrink-0 snap-start ${
              isCompact ? "w-[155px] sm:w-[180px] lg:w-[200px]" : "w-[175px] sm:w-[220px] lg:w-[260px]"
            }`}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

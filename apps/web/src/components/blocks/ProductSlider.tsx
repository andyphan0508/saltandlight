"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ChevronLeft, ChevronRight } from "@/components/Icons";
import type { ProductCardData } from "@/lib/types";

export function ProductSlider({ products }: { products: ProductCardData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  }

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
        className="flex gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-3 px-1"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[175px] sm:w-[220px] md:w-[240px] lg:w-[260px] xl:w-[280px] flex-shrink-0 snap-start"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

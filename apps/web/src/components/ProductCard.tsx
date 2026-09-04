"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@saltandlight/ui";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { useWishlistStore } from "@/lib/wishlist-store";
import { Heart, Star, ShoppingBag } from "./Icons";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  const isWished = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const discount = calcDiscountPercent(product.minPrice, product.maxCompareAtPrice);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white p-2.5 sm:p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover border border-ink/5">
      <div>
        {/* Image Container - compact & clean */}
        <Link href={`/san-pham/${product.slug}`} className="relative block aspect-square sm:aspect-[4/5] overflow-hidden rounded-xl bg-mint-50/70">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-mint-100/60 text-center p-3">
              <span className="font-display text-xs font-black uppercase tracking-wider text-ink/40">
                Salt &amp; Light
              </span>
              <span className="text-[10px] text-ink/30 mt-0.5">Faith Apparel</span>
            </div>
          )}

          {/* Badges on Top Left */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
            {product.isFeatured && (
              <span className="inline-block rounded-full bg-brand-forest text-mint-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                ★ Nổi bật
              </span>
            )}
            {product.isNew && <Badge tone="new">Mới</Badge>}
            {discount && <Badge tone="sale">-{discount}%</Badge>}
          </div>

          {/* Hover Quick Action Overlay */}
          <div className="absolute inset-x-2 bottom-2 z-10 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden sm:block">
            <div className="flex items-center justify-center gap-1.5 rounded-full bg-ink/90 py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-md">
              <ShoppingBag size={12} className="text-mint-200" />
              <span>Xem chi tiết</span>
            </div>
          </div>
        </Link>

        {/* Wishlist Button - compact */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-pressed={isWished}
          aria-label={isWished ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          className={`absolute right-3.5 top-3.5 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 shadow-sm ${
            isWished
              ? "bg-rose-50 text-sale scale-110 shadow-rose-200/50"
              : "bg-white/90 text-ink/60 hover:bg-white hover:text-sale hover:scale-110"
          }`}
        >
          <Heart size={14} fill={isWished ? "currentColor" : "none"} />
        </button>

        {/* Info - compact */}
        <div className="mt-2.5 px-0.5">
          {/* Micro tag & rating */}
          <div className="flex items-center justify-between text-[10px] text-ink/50">
            <div className="flex items-center gap-0.5 text-gold-600">
              <Star size={11} fill="currentColor" />
              <span className="font-bold">5.0</span>
            </div>
            <span className="text-brand-forest font-semibold text-[10px]">100% Cotton</span>
          </div>

          {/* Product Title */}
          <Link href={`/san-pham/${product.slug}`} className="mt-1 block">
            <h3 className="line-clamp-2 text-xs sm:text-[13px] font-bold text-ink hover:text-brand-forest transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Pricing - compact */}
      <div className="mt-2 border-t border-ink/5 pt-2 px-0.5 flex items-baseline justify-between">
        <div className="flex flex-wrap items-baseline gap-1">
          <span className="text-xs sm:text-sm font-black text-ink">{formatVND(product.minPrice)}</span>
          {product.maxCompareAtPrice && (
            <span className="text-[10px] sm:text-[11px] text-ink/40 line-through">
              {formatVND(product.maxCompareAtPrice)}
            </span>
          )}
        </div>
        {discount && (
          <span className="text-[10px] font-bold text-sale">
            -{discount}%
          </span>
        )}
      </div>
    </div>
  );
}

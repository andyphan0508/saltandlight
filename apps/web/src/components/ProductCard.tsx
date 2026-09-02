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
    <div className="group relative flex flex-col justify-between rounded-3xl bg-white p-3.5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover border border-ink/5">
      <div>
        {/* Image Container */}
        <Link href={`/san-pham/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-mint-50">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-mint-100 text-center p-4">
              <span className="font-display text-sm font-black uppercase tracking-wider text-ink/40">
                Salt &amp; Light
              </span>
              <span className="text-[11px] text-ink/30 mt-1">Faith Apparel</span>
            </div>
          )}

          {/* Badges on Top Left */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10">
            {product.isNew && <Badge tone="new">Mới</Badge>}
            {discount && <Badge tone="sale">-{discount}%</Badge>}
          </div>

          {/* Hover Quick Action Overlay */}
          <div className="absolute inset-x-3 bottom-3 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden sm:block">
            <div className="flex items-center justify-center gap-2 rounded-full bg-ink/90 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white backdrop-blur shadow-lg">
              <ShoppingBag size={14} className="text-mint-200" />
              <span>Xem chi tiết</span>
            </div>
          </div>
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-pressed={isWished}
          aria-label={isWished ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          className={`absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 shadow-sm ${
            isWished
              ? "bg-rose-50 text-sale scale-110 shadow-rose-200/50"
              : "bg-white/90 text-ink/60 hover:bg-white hover:text-sale hover:scale-110"
          }`}
        >
          <Heart size={18} fill={isWished ? "currentColor" : "none"} />
        </button>

        {/* Info */}
        <div className="mt-3.5 px-1">
          {/* Category / Rating snippet */}
          <div className="flex items-center justify-between text-xs text-ink/50">
            <div className="flex items-center gap-1 text-gold-600">
              <Star size={13} fill="currentColor" />
              <span className="text-[11px] font-bold">5.0</span>
              <span className="text-[10px] text-ink/40">(Cơ Đốc)</span>
            </div>
            <span className="text-[11px] text-brand-forest font-medium">100% Cotton</span>
          </div>

          {/* Product Title */}
          <Link href={`/san-pham/${product.slug}`} className="mt-1.5 block">
            <h3 className="line-clamp-2 text-sm font-bold text-ink hover:text-brand-forest transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-3 border-t border-ink/5 pt-2.5 px-1 flex items-baseline justify-between">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-base font-black text-ink">{formatVND(product.minPrice)}</span>
          {product.maxCompareAtPrice && (
            <span className="text-xs text-ink/40 line-through">
              {formatVND(product.maxCompareAtPrice)}
            </span>
          )}
        </div>
        {discount && (
          <span className="text-[11px] font-bold text-sale">
            Tiết kiệm {formatVND((product.maxCompareAtPrice || 0) - product.minPrice)}
          </span>
        )}
      </div>
    </div>
  );
}

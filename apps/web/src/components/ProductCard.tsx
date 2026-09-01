"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@saltandlight/ui";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { useWishlistStore } from "@/lib/wishlist-store";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  const isWished = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const discount = calcDiscountPercent(product.minPrice, product.maxCompareAtPrice);

  return (
    <div className="group relative">
      <Link href={`/san-pham/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-mint-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink/30">Salt & Light</div>
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isNew && <Badge tone="new">New</Badge>}
            {discount && <Badge tone="sale">-{discount}%</Badge>}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={isWished}
        aria-label="Thêm vào yêu thích"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isWished ? "#c8452e" : "none"}
          stroke={isWished ? "#c8452e" : "currentColor"}
          strokeWidth="1.8"
        >
          <path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.4 4.5 6 4.5c2.1 0 3.7 1.1 6 3.6 2.3-2.5 3.9-3.6 6-3.6 3.6 0 5.5 3.5 4 7.2C19.5 16.3 12 21 12 21z" />
        </svg>
      </button>
      <div className="mt-3">
        <Link href={`/san-pham/${product.slug}`} className="text-sm font-medium hover:underline">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="font-semibold">{formatVND(product.minPrice)}</span>
          {product.maxCompareAtPrice && (
            <span className="text-ink/40 line-through">{formatVND(product.maxCompareAtPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

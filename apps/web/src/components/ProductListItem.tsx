"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge, Button } from "@saltandlight/ui";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { useWishlistStore } from "@/lib/wishlist-store";
import { Heart } from "./Icons";
import type { ProductCardData } from "@/lib/types";

export function ProductListItem({ product }: { product: ProductCardData }) {
  const isWished = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const discount = calcDiscountPercent(product.minPrice, product.maxCompareAtPrice);

  return (
    <div className="flex gap-4 rounded-2xl border border-ink/5 bg-white p-3.5 shadow-card transition-shadow hover:shadow-card-hover sm:gap-6 sm:p-4">
      <Link
        href={`/san-pham/${product.slug}`}
        className="relative block aspect-square w-28 flex-shrink-0 overflow-hidden rounded-xl bg-mint-50 sm:w-40"
      >
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill sizes="160px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">Salt &amp; Light</div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && <Badge tone="new">Mới</Badge>}
          {discount && <Badge tone="sale">-{discount}%</Badge>}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div>
          <Link href={`/san-pham/${product.slug}`}>
            <h3 className="text-sm font-bold text-ink hover:text-brand-forest sm:text-base">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 hidden text-xs text-ink/50 sm:block">100% Cotton · In DTG cao cấp</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-ink sm:text-lg">{formatVND(product.minPrice)}</span>
            {product.maxCompareAtPrice && (
              <span className="text-xs text-ink/40 line-through">{formatVND(product.maxCompareAtPrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={isWished}
              aria-label="Yêu thích"
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                isWished ? "border-sale/30 bg-sale-light text-sale" : "border-ink/15 text-ink/50 hover:text-sale"
              }`}
            >
              <Heart size={16} fill={isWished ? "currentColor" : "none"} />
            </button>
            <Link href={`/san-pham/${product.slug}`}>
              <Button size="sm" variant="outline">
                Xem chi tiết
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

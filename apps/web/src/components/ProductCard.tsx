"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";
import { toast } from "sonner";
import { Badge } from "@saltandlight/ui";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { useWishlistStore } from "@/stores/wishlist-store";
import { Heart, ShoppingBag } from "./Icons";
import type { ProductCardData } from "@/interfaces/catalog";

export const ProductCard = ({ product }: { product: ProductCardData }) => {
  const isWished = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const discount = calcDiscountPercent(product.minPrice, product.maxCompareAtPrice);
  // Name only the card that was tapped: the same product can sit in two sections of a
  // page, and two elements sharing a name cancel the transition. Cleared once it's
  // over, so a later tap on another card doesn't find this one still named.
  const onOpenProduct = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const box = e.currentTarget.closest("[data-product-card]")?.querySelector<HTMLElement>("[data-product-image]");
    if (!box) return;
    // On a product page its own photo holds the name; the page is being left, so let go of it
    document.querySelectorAll<HTMLElement>("[style*='product-hero']").forEach((el) => el.style.removeProperty("view-transition-name"));
    box.style.viewTransitionName = "product-hero";
    setTimeout(() => box.style.removeProperty("view-transition-name"), 1000);
  };

  const onToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isWished) {
      toast.success("Đã lưu vào yêu thích ❤️", {
        description: product.name,
      });
    } else {
      toast.info("Đã xóa khỏi danh sách yêu thích", {
        description: product.name,
      });
    }
  };

  return (
    <div
      data-reveal
      data-product-card
      className="group relative flex flex-col justify-between rounded-2xl bg-white p-2.5 sm:p-3 shadow-card transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.985] border border-ink/5"
    >
      <div>
        {/* Image Container - compact & clean */}
        <Link
          data-product-image
          href={`/san-pham/${product.slug}`}
          onClick={onOpenProduct}
          className="relative block aspect-square sm:aspect-[4/5] overflow-hidden rounded-xl bg-mint-50/70"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-mint-100/60 text-center p-3">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-ink/40">
                Salt &amp; Light
              </span>
              <span className="text-[10px] text-ink/30 mt-0.5">Faith Apparel</span>
            </div>
          )}

          {/* Badges on Top Left */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
            {product.isFeatured && (
              <span className="inline-block rounded-full bg-brand-forest text-mint-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                ★ Nổi bật
              </span>
            )}
            {product.isNew && <Badge tone="new">Mới</Badge>}
            {discount && <Badge tone="sale">-{discount}%</Badge>}
          </div>

          {/* Hover Quick Action Overlay */}
          <div className="absolute inset-x-2 bottom-2 z-10 translate-y-3 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 hidden sm:block">
            <div className="flex items-center justify-center gap-1.5 rounded-full bg-ink/90 py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-md">
              <ShoppingBag size={12} className="text-mint-200" />
              <span>Xem chi tiết</span>
            </div>
          </div>
        </Link>

        {/* Wishlist Button - compact */}
        <button
          type="button"
          onClick={onToggleWishlist}
          aria-pressed={isWished}
          aria-label={isWished ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          className={`heart-pop absolute right-3.5 top-3.5 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 shadow-sm active-press ${
            isWished
              ? "bg-rose-50 text-sale scale-110 shadow-rose-200/50"
              : "bg-white/90 text-ink/60 hover:bg-white hover:text-sale hover:scale-110"
          }`}
        >
          <Heart size={14} fill={isWished ? "currentColor" : "none"} />
        </button>

        {/* Info - compact */}
        <div className="mt-2.5 px-0.5">
          {/* Product Title */}
          <Link href={`/san-pham/${product.slug}`} onClick={onOpenProduct} className="block">
            <h3 className="line-clamp-2 text-xs sm:text-[13px] font-bold text-ink hover:text-brand-forest transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Pricing - compact */}
      <div className="mt-2 border-t border-ink/5 pt-2 px-0.5 flex items-baseline justify-between">
        <div className="flex flex-wrap items-baseline gap-1">
          <span className="text-xs sm:text-sm font-bold text-ink">{formatVND(product.minPrice)}</span>
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

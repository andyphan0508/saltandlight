"use client";

import { toast } from "sonner";
import { Heart } from "@/components/Icons";
import { useWishlistStore } from "@/stores/wishlist-store";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
}

/** Saves or removes the product from the wishlist and confirms with a toast. */
export const WishlistButton = ({ productId, productName }: WishlistButtonProps) => {
  const isWished = useWishlistStore((s) => s.has(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const onToggle = () => {
    toggleWishlist(productId);
    const description = productName || "Sản phẩm";
    if (isWished) toast.info("Đã xóa khỏi danh sách yêu thích", { description });
    else toast.success("Đã lưu vào yêu thích ❤️", { description });
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isWished}
      className={`flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-bold transition-all active-press ${
        isWished ? "border-rose-300 bg-rose-50 text-sale shadow-sm" : "border-ink/15 bg-white text-ink hover:border-ink/30"
      }`}
    >
      <Heart size={16} fill={isWished ? "currentColor" : "none"} />
      <span>{isWished ? "Đã lưu" : "Lưu yêu thích"}</span>
    </button>
  );
};

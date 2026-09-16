"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DEFAULT_PRICE_NOTE } from "@/helpers/product-content";
import { useVariantSelection } from "@/hooks/use-variant-selection";
import type { ProductVariantOption } from "@/interfaces/catalog";
import { useCartStore } from "@/stores/cart-store";
import { BuyActions } from "./BuyActions";
import { ColorOptions } from "./ColorOptions";
import { PriceBox } from "./PriceBox";
import { QuantityStepper } from "./QuantityStepper";
import { SizeOptions } from "./SizeOptions";
import { WishlistButton } from "./WishlistButton";

interface ProductBuyBoxProps {
  productId: string;
  productName?: string;
  variants: ProductVariantOption[];
  /** Admin-set promo line: `null` = never set (show the default), "" = hidden. */
  priceNote: string | null;
}

/** Variant picker, price, quantity, wishlist and add-to-cart / buy-now for the product page. */
export const ProductBuyBox = ({ productId, productName, variants, priceNote }: ProductBuyBoxProps) => {
  const router = useRouter();
  const { colors, sizes, color, size, selected, setColor, setSize } = useVariantSelection(variants);
  const [quantity, setQuantity] = useState(1);
  const [isJustAdded, setIsJustAdded] = useState(false);
  const addToCart = useCartStore((s) => s.add);

  if (!selected) return null;

  const isOutOfStock = selected.stockQuantity <= 0;

  const onAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(selected.id, quantity);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 2200);

    const variantLabel = [selected.size ? `Size ${selected.size}` : null, selected.color ? `Màu ${selected.color}` : null]
      .filter(Boolean)
      .join(" - ");
    toast.success("Đã thêm vào giỏ hàng!", {
      description: `${productName || "Sản phẩm"} ${variantLabel ? `(${variantLabel})` : ""} × ${quantity}`,
    });
  };

  const onBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(selected.id, quantity);
    router.push("/thanh-toan");
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full min-w-0">
      <PriceBox price={selected.price} compareAtPrice={selected.compareAtPrice} note={(priceNote ?? DEFAULT_PRICE_NOTE).trim()} />

      {colors.length > 0 && <ColorOptions colors={colors} value={color} onChange={setColor} />}

      {sizes.length > 0 && <SizeOptions sizes={sizes} value={size} onChange={setSize} />}

      <div className="w-full min-w-0">
        <div className="flex items-center justify-between text-xs text-ink/70 gap-2">
          <span className="font-bold uppercase tracking-wider flex-shrink-0">Số lượng</span>
          {isOutOfStock ? (
            <span className="font-bold text-sale">Hết hàng</span>
          ) : (
            <span className="text-brand-forest font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Còn hàng sẵn
            </span>
          )}
        </div>
        <div className="mt-2.5 flex items-center gap-3 sm:gap-4">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <WishlistButton productId={productId} productName={productName} />
        </div>
      </div>

      <BuyActions isOutOfStock={isOutOfStock} isJustAdded={isJustAdded} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />

    </div>
  );
};

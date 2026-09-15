import { Button } from "@saltandlight/ui";
import { Check, ShoppingBag } from "@/components/Icons";

interface BuyActionsProps {
  isOutOfStock: boolean;
  isJustAdded: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

/** "Add to cart" (briefly confirms) and "Buy now" buttons, both disabled when out of stock. */
export const BuyActions = ({ isOutOfStock, isJustAdded, onAddToCart, onBuyNow }: BuyActionsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full pt-1">
    <Button
      variant="outline"
      size="lg"
      disabled={isOutOfStock}
      onClick={onAddToCart}
      className="w-full h-12 flex items-center justify-center gap-2 active-press rounded-2xl text-xs sm:text-sm font-bold border-ink/20 hover:border-ink hover:bg-mint-50/50"
    >
      {isJustAdded ? (
        <>
          <Check size={18} className="text-emerald-600 animate-bounce-soft" />
          <span className="text-emerald-700 font-bold">Đã thêm vào giỏ!</span>
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          <span>Thêm vào giỏ</span>
        </>
      )}
    </Button>

    <Button
      variant="primary"
      size="lg"
      disabled={isOutOfStock}
      onClick={onBuyNow}
      className="w-full h-12 flex items-center justify-center gap-2 bg-ink text-white hover:bg-ink-800 shadow-md active-press rounded-2xl text-xs sm:text-sm font-bold tracking-wide"
    >
      {isOutOfStock ? "Tạm hết hàng" : "Mua ngay — Nhận ưu đãi"}
    </Button>
  </div>
);

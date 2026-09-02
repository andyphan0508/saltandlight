"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@saltandlight/ui";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  Sparkles,
  X,
  Star,
} from "./Icons";

export interface VariantPlain {
  id: string;
  color: string | null;
  size: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
}

export function ProductBuyBox({
  productId,
  productName,
  variants,
}: {
  productId: string;
  productName?: string;
  variants: VariantPlain[];
}) {
  const router = useRouter();
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[],
    [variants],
  );
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[],
    [variants],
  );

  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const selected =
    variants.find((v) => (color ? v.color === color : true) && (size ? v.size === size : true)) ??
    variants[0];

  const add = useCartStore((s) => s.add);
  const isWished = useWishlistStore((s) => s.has(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  if (!selected) return null;

  const discount = calcDiscountPercent(selected.price, selected.compareAtPrice);
  const outOfStock = selected.stockQuantity <= 0;
  const savings = selected.compareAtPrice ? selected.compareAtPrice - selected.price : 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    add(selected.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    add(selected.id, quantity);
    router.push("/thanh-toan");
  };

  return (
    <div className="space-y-6">
      {/* Price Header */}
      <div className="rounded-2xl bg-mint-50/80 p-5 border border-mint-200/60">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-black text-ink">{formatVND(selected.price)}</span>
          {selected.compareAtPrice && (
            <span className="text-base text-ink/40 line-through">
              {formatVND(selected.compareAtPrice)}
            </span>
          )}
          {discount && <Badge tone="sale">Giảm {discount}%</Badge>}
        </div>
        {savings > 0 && (
          <p className="mt-1.5 text-xs font-semibold text-sale">
            Tiết kiệm {formatVND(savings)} so với giá niêm yết
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-brand-forest">
          <Sparkles size={15} />
          <span>Tặng kèm thiệp Lời Chúa &amp; Miễn phí vận chuyển cho đơn từ 299K</span>
        </div>
      </div>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
              Màu sắc: <strong className="text-ink">{color}</strong>
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const active = c === color;
              const isDark = c.toLowerCase().includes("đen") || c.toLowerCase().includes("black");
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? "border-ink bg-ink text-white shadow-sm ring-2 ring-ink/20"
                      : "border-ink/15 bg-white text-ink hover:border-ink/40"
                  }`}
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full border ${
                      isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-300"
                    }`}
                  />
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection & Size Guide */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
              Kích thước: <strong className="text-ink">{size}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowSizeModal(true)}
              className="text-xs font-bold text-brand-forest underline hover:text-ink transition-colors"
            >
              📏 Bảng quy đổi size
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {sizes.map((s) => {
              const active = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-xs font-bold transition-all ${
                    active
                      ? "border-ink bg-ink text-white shadow-sm ring-2 ring-ink/20"
                      : "border-ink/15 bg-white text-ink hover:border-ink/40"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Inventory */}
      <div>
        <div className="flex items-center justify-between text-xs text-ink/70">
          <span className="font-bold uppercase tracking-wider">Số lượng</span>
          <span>
            {outOfStock ? (
              <span className="font-bold text-sale">Hết hàng</span>
            ) : (
              <span className="text-brand-forest font-medium">✓ Còn hàng sẵn</span>
            )}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-4">
          <div className="flex items-center rounded-2xl border border-ink/20 bg-white p-1 shadow-sm">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-ink/5 disabled:opacity-30"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-bold text-ink">{quantity}</span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-ink/5"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(productId)}
            className={`flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-bold transition-colors ${
              isWished
                ? "border-rose-300 bg-rose-50 text-sale"
                : "border-ink/15 bg-white text-ink hover:border-ink/30"
            }`}
          >
            <Heart size={16} fill={isWished ? "currentColor" : "none"} />
            <span>{isWished ? "Đã lưu" : "Lưu yêu thích"}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons: Add to Cart + Buy Now */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-3.5"
          >
            {justAdded ? (
              <>
                <Check size={18} className="text-emerald-600" />
                <span className="text-emerald-700">Đã thêm vào giỏ!</span>
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
            disabled={outOfStock}
            onClick={handleBuyNow}
            className="w-full bg-ink text-white hover:bg-ink-800 shadow-md py-3.5"
          >
            {outOfStock ? "Tạm hết hàng" : "Mua ngay — Nhận ưu đãi"}
          </Button>
        </div>
      </div>

      {/* Trust Guarantees */}
      <div className="space-y-2.5 rounded-2xl border border-ink/10 bg-white p-4 text-xs text-ink/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Truck size={18} className="text-brand-forest flex-shrink-0" />
          <span>
            <strong>Đồng giá ship 19K toàn quốc</strong> — Giao tận nơi trong 2-4 ngày.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-brand-forest flex-shrink-0" />
          <span>
            <strong>Kiểm tra hàng trước khi nhận</strong> — COD an tâm tuyệt đối.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCw size={18} className="text-brand-forest flex-shrink-0" />
          <span>
            <strong>Đổi size miễn phí trong 7 ngày</strong> nếu không vừa vặn.
          </span>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSizeModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <h3 className="font-display text-lg font-black uppercase text-ink">
                Bảng Quy Đổi Size Áo Chuẩn
              </h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="rounded-full p-2 text-ink/50 hover:bg-ink/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-ink/70">
                Form áo Regular Fit tiêu chuẩn, dáng suông thoải mái cho cả nam &amp; nữ. Nếu thích
                mặc rộng rãi phong cách oversize, bạn có thể tăng lên 1 size.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-mint-100 text-ink font-bold uppercase">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">Size</th>
                      <th className="p-2.5">Chiều cao</th>
                      <th className="p-2.5">Cân nặng</th>
                      <th className="p-2.5 rounded-r-lg">Dài áo / Rộng áo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    <tr>
                      <td className="p-2.5 font-bold">S</td>
                      <td className="p-2.5">1m50 - 1m62</td>
                      <td className="p-2.5">42 - 52 kg</td>
                      <td className="p-2.5">66cm / 48cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">M</td>
                      <td className="p-2.5">1m60 - 1m70</td>
                      <td className="p-2.5">53 - 62 kg</td>
                      <td className="p-2.5">69cm / 51cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">L</td>
                      <td className="p-2.5">1m68 - 1m76</td>
                      <td className="p-2.5">63 - 72 kg</td>
                      <td className="p-2.5">72cm / 54cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">XL</td>
                      <td className="p-2.5">1m75 - 1m85</td>
                      <td className="p-2.5">73 - 85 kg</td>
                      <td className="p-2.5">75cm / 57cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-2xl bg-cream p-4 text-xs text-ink/70">
                <p className="font-bold text-ink">💡 Bạn còn phân vân size?</p>
                <p className="mt-1">
                  Hãy nhắn ngay hotline/Zalo <strong>0847 25 2025</strong>, đội ngũ tư vấn sẽ hỗ
                  trợ bạn chọn size vừa vặn nhất!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

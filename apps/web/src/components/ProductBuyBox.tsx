"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge, Button } from "@saltandlight/ui";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { useCartStore, useWishlistStore } from "@/stores";
import {
  ShoppingBag,
  Heart,
  Check,
  Sparkles,
  X,
} from "./Icons";

import {
  parseProductContent,
  type ProductContentBlock,
} from "@/lib/product-content";

export interface VariantPlain {
  id: string;
  color: string | null;
  size: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
}

const SIZE_ORDER = [
  "XS (BABY)",
  "S (BABY)",
  "M (BABY)",
  "L (BABY)",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "XXL",
  "3XL",
  "FREE SIZE",
];

export const ProductBuyBox = ({
  productId,
  productName,
  variants,
  description,
}: {
  productId: string;
  productName?: string;
  variants: VariantPlain[];
  description?: string | null;
}) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[],
    [variants],
  );

  // Đảo ngược thứ tự size hiển thị: từ nhỏ đến lớn (XS, S, M, L, XL...)
  const sizes = useMemo(() => {
    const raw = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[];
    return raw.sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a.trim().toUpperCase());
      const bi = SIZE_ORDER.indexOf(b.trim().toUpperCase());
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return b.localeCompare(a); // Fallback: đảo ngược thứ tự
    });
  }, [variants]);

  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [isJustAdded, setIsJustAdded] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Tự động cập nhật size khi danh sách sizes thay đổi
  useEffect(() => {
    if (sizes.length > 0 && (!size || !sizes.includes(size))) {
      setSize(sizes[0] ?? null);
    }
  }, [sizes, size]);

  const { specsTables, priceNote } = useMemo(() => {
    if (!description) return { specsTables: [], priceNote: null };
    const blocks = parseProductContent(description);
    const tables = blocks.filter(
      (b): b is Extract<ProductContentBlock, { type: "specs_table" }> => b.type === "specs_table"
    );
    const noteBlock = blocks.find(
      (b): b is Extract<ProductContentBlock, { type: "price_note" }> => b.type === "price_note"
    );
    return {
      specsTables: tables,
      priceNote: noteBlock ? noteBlock.text : null,
    };
  }, [description]);

  // Prevent scroll when modal is open and handle ESC key
  useEffect(() => {
    if (isSizeModalOpen) {
      document.body.style.overflow = "hidden";
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsSizeModalOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [isSizeModalOpen]);

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

  const onAddToCart = () => {
    if (outOfStock) return;
    add(selected.id, quantity);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 2200);

    const variantLabel = [
      selected.size ? `Size ${selected.size}` : null,
      selected.color ? `Màu ${selected.color}` : null,
    ]
      .filter(Boolean)
      .join(" - ");

    toast.success("Đã thêm vào giỏ hàng!", {
      description: `${productName || "Sản phẩm"} ${variantLabel ? `(${variantLabel})` : ""} × ${quantity}`,
    });
  };

  const onBuyNow = () => {
    if (outOfStock) return;
    add(selected.id, quantity);
    router.push("/thanh-toan");
  };

  const onToggleWishlist = () => {
    toggleWishlist(productId);
    if (!isWished) {
      toast.success("Đã lưu vào yêu thích ❤️", {
        description: productName || "Sản phẩm",
      });
    } else {
      toast.info("Đã xóa khỏi danh sách yêu thích", {
        description: productName || "Sản phẩm",
      });
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Price Header */}
      <div className="rounded-2xl bg-mint-50/80 p-4 sm:p-5 border border-mint-200/60 w-full min-w-0">
        <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
          <span className="text-2xl sm:text-3xl font-bold text-ink">{formatVND(selected.price)}</span>
          {selected.compareAtPrice && (
            <span className="text-sm sm:text-base text-ink/40 line-through">
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
        {(priceNote === null || (priceNote && priceNote.trim().length > 0)) && (
          <div className="mt-3 flex items-start gap-2 text-xs text-brand-forest">
            <Sparkles size={15} className="flex-shrink-0 mt-0.5 text-gold-600" />
            <span className="leading-snug">
              {priceNote && priceNote.trim().length > 0
                ? priceNote
                : "Tặng kèm thiệp Lời Chúa & Miễn phí vận chuyển cho đơn từ 299K"}
            </span>
          </div>
        )}
      </div>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="w-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
              Màu sắc: <strong className="text-ink">{color}</strong>
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
            {colors.map((c) => {
              const active = c === color;
              const isDark = c.toLowerCase().includes("đen") || c.toLowerCase().includes("black");
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition-all active-press ${
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
        <div className="w-full min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70 flex-shrink-0">
              Kích thước: <strong className="text-ink">{size}</strong>
            </span>
            {specsTables.length > 0 && (
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(true)}
                className="text-xs font-bold text-brand-forest underline hover:text-ink transition-colors flex-shrink-0 flex items-center gap-1 active-press"
              >
                <span>📏 Bảng size</span>
              </button>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
            {sizes.map((s) => {
              const active = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex h-10 sm:h-11 min-w-10 sm:min-w-11 items-center justify-center rounded-xl border px-3 text-xs font-bold transition-all active-press ${
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
      <div className="w-full min-w-0">
        <div className="flex items-center justify-between text-xs text-ink/70 gap-2">
          <span className="font-bold uppercase tracking-wider flex-shrink-0">Số lượng</span>
          <span className="flex-shrink-0">
            {outOfStock ? (
              <span className="font-bold text-sale">Hết hàng</span>
            ) : (
              <span className="text-brand-forest font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Còn hàng sẵn
              </span>
            )}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center rounded-2xl border border-ink/20 bg-white p-1 shadow-sm">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-ink/5 disabled:opacity-30 active-press"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-bold text-ink">{quantity}</span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-ink/5 active-press"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleWishlist}
            className={`flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-bold transition-all active-press ${
              isWished
                ? "border-rose-300 bg-rose-50 text-sale shadow-sm"
                : "border-ink/15 bg-white text-ink hover:border-ink/30"
            }`}
          >
            <Heart size={16} fill={isWished ? "currentColor" : "none"} />
            <span>{isWished ? "Đã lưu" : "Lưu yêu thích"}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons: Add to Cart + Buy Now */}
      <div className="space-y-3 pt-1 w-full min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
          <Button
            variant="outline"
            size="lg"
            disabled={outOfStock}
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
            disabled={outOfStock}
            onClick={onBuyNow}
            className="w-full h-12 flex items-center justify-center gap-2 bg-ink text-white hover:bg-ink-800 shadow-md active-press rounded-2xl text-xs sm:text-sm font-bold tracking-wide"
          >
            {outOfStock ? "Tạm hết hàng" : "Mua ngay — Nhận ưu đãi"}
          </Button>
        </div>
      </div>


      {/* Size Chart Modal rendered via Portal directly to body */}
      {isMounted &&
        isSizeModalOpen &&
        specsTables.length > 0 &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div
              className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity animate-fade-in"
              onClick={() => setIsSizeModalOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl z-10 my-auto max-h-[90vh] overflow-y-auto animate-pop-in border border-ink/10">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <h3 className="font-display text-lg font-bold uppercase text-ink flex items-center gap-2">
                  <span>📏 Bảng Thông Số &amp; Quy Đổi Size</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSizeModalOpen(false)}
                  className="rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink transition-colors"
                  title="Đóng (ESC)"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {specsTables.map((table, tIdx) => (
                  <div key={table.id || tIdx} className="overflow-hidden rounded-2xl border border-ink/10 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-ink/10 bg-white">
                        {table.rows
                          .filter((r) => r.label || r.value)
                          .map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                              <td className="p-3 font-bold text-ink/80 w-1/3 sm:w-1/4 border-r border-ink/5">
                                {row.label}
                              </td>
                              <td className="p-3 font-medium text-ink">
                                {row.value}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                <div className="rounded-2xl bg-cream p-4 text-xs text-ink/70 border border-ink/5">
                  <p className="font-bold text-ink flex items-center gap-1.5">
                    <span>💡 Bạn còn phân vân chưa chắc chắn về size?</span>
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Hãy liên hệ ngay hotline/Zalo <strong>0847 25 2025</strong>, đội ngũ tư vấn sẽ hỗ
                    trợ bạn chọn size chuẩn và vừa vặn nhất!
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-ink/10 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSizeModalOpen(false)}
                  className="rounded-xl px-5 py-2 text-xs font-bold"
                >
                  Đã hiểu &amp; Đóng
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

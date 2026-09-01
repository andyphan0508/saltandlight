"use client";

import { useMemo, useState } from "react";
import { Badge, Button } from "@saltandlight/ui";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCompareStore } from "@/lib/compare-store";

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
  variants,
}: {
  productId: string;
  variants: VariantPlain[];
}) {
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

  const selected = variants.find((v) => v.color === color && v.size === size) ?? variants[0];

  const add = useCartStore((s) => s.add);
  const isWished = useWishlistStore((s) => s.has(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isCompared = useCompareStore((s) => s.has(productId));
  const toggleCompare = useCompareStore((s) => s.toggle);

  if (!selected) return null;

  const discount = calcDiscountPercent(selected.price, selected.compareAtPrice);
  const outOfStock = selected.stockQuantity <= 0;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{formatVND(selected.price)}</span>
        {selected.compareAtPrice && (
          <span className="text-ink/40 line-through">{formatVND(selected.compareAtPrice)}</span>
        )}
        {discount && <Badge tone="sale">-{discount}%</Badge>}
      </div>

      {colors.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-bold uppercase tracking-wide text-ink/60">Màu sắc</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`rounded-pill border px-4 py-1.5 text-sm ${
                  c === color ? "border-ink bg-ink text-white" : "border-ink/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wide text-ink/60">Kích thước</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`h-10 min-w-10 rounded-full border px-3 text-sm ${
                  s === size ? "border-ink bg-ink text-white" : "border-ink/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center rounded-pill border border-ink/20">
          <button
            className="h-10 w-10 text-lg"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button className="h-10 w-10 text-lg" onClick={() => setQuantity((q) => q + 1)}>
            +
          </button>
        </div>
        <Button
          className="flex-1"
          disabled={outOfStock}
          onClick={() => {
            add(selected.id, quantity);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1800);
          }}
        >
          {outOfStock ? "Hết hàng" : justAdded ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ hàng"}
        </Button>
      </div>

      <div className="mt-3 flex gap-4 text-xs font-semibold uppercase text-ink/60">
        <button onClick={() => toggleWishlist(productId)} className="hover:text-ink">
          {isWished ? "✓ Đã lưu yêu thích" : "+ Lưu yêu thích"}
        </button>
        <button onClick={() => toggleCompare(productId)} className="hover:text-ink">
          {isCompared ? "✓ Đang so sánh" : "+ So sánh"}
        </button>
      </div>
    </div>
  );
}

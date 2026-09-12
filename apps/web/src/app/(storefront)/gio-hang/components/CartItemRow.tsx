import Link from "next/link";
import Image from "next/image";
import { formatVND } from "@saltandlight/domain";
import { Trash2 } from "@/components/Icons";
import type { QuoteLine } from "../types";

export interface CartItemRowProps {
  line: QuoteLine;
  onQuantityChange: (productVariantId: string, nextQuantity: number) => void;
  onRemove: (productVariantId: string) => void;
}

export const CartItemRow = ({
  line,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) => {
  return (
    <div className="flex gap-4 rounded-3xl bg-white p-4 sm:p-5 shadow-card border border-ink/5 items-center">
      {/* Product Thumbnail */}
      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-mint-50">
        {line.image ? (
          <Image src={line.image} alt={line.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-ink/30 font-bold">
            Salt &amp; Light
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/san-pham/${line.slug}`}
          className="font-bold text-sm text-ink hover:text-brand-forest transition-colors line-clamp-1"
        >
          {line.name}
        </Link>

        <div className="mt-1 flex items-center gap-2 text-xs text-ink/50">
          <span>Màu: <strong className="text-ink">{line.color ?? "Tiêu chuẩn"}</strong></span>
          <span>•</span>
          <span>Size: <strong className="text-ink">{line.size ?? "Free"}</strong></span>
        </div>

        <div className="mt-1.5 text-xs font-semibold text-ink/70">
          {formatVND(line.unitPrice)}
        </div>

        {/* Quantity Controls & Delete */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-xl border border-ink/20 bg-cream-50 p-0.5">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink hover:bg-ink/10"
              onClick={() => onQuantityChange(line.productVariantId, line.quantity - 1)}
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-bold text-ink">
              {line.quantity}
            </span>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink hover:bg-ink/10"
              onClick={() =>
                onQuantityChange(
                  line.productVariantId,
                  Math.min(line.quantity + 1, line.availableStock),
                )
              }
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(line.productVariantId)}
            className="flex items-center gap-1 text-xs text-sale hover:underline transition-colors"
          >
            <Trash2 size={13} />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="text-right flex-shrink-0">
        <span className="text-sm font-bold text-ink">{formatVND(line.lineTotal)}</span>
      </div>
    </div>
  );
};

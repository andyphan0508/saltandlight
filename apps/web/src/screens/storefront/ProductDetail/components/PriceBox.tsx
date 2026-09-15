import { Badge } from "@saltandlight/ui";
import { calcDiscountPercent, formatVND } from "@saltandlight/domain";
import { Sparkles } from "@/components/Icons";

interface PriceBoxProps {
  price: number;
  compareAtPrice: number | null;
  /** Promo line under the price; empty hides it. */
  note: string;
}

/** Sale price, list price with discount badge and savings, plus the promo line. */
export const PriceBox = ({ price, compareAtPrice, note }: PriceBoxProps) => {
  const discount = calcDiscountPercent(price, compareAtPrice);
  const savings = compareAtPrice ? compareAtPrice - price : 0;

  return (
    <div className="rounded-2xl bg-mint-50/80 p-4 sm:p-5 border border-mint-200/60 w-full min-w-0">
      <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
        <span className="text-2xl sm:text-3xl font-bold text-ink">{formatVND(price)}</span>
        {compareAtPrice && <span className="text-sm sm:text-base text-ink/40 line-through">{formatVND(compareAtPrice)}</span>}
        {discount && <Badge tone="sale">Giảm {discount}%</Badge>}
      </div>
      {savings > 0 && <p className="mt-1.5 text-xs font-semibold text-sale">Tiết kiệm {formatVND(savings)} so với giá niêm yết</p>}
      {note && (
        <div className="mt-3 flex items-start gap-2 text-xs text-brand-forest">
          <Sparkles size={15} className="flex-shrink-0 mt-0.5 text-gold-600" />
          <span className="leading-snug">{note}</span>
        </div>
      )}
    </div>
  );
};

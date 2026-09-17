import { formatVND } from "@saltandlight/domain";
import { Truck } from "@/components/Icons";
import type { CheckoutQuote } from "@/interfaces/checkout";
import { OrderSummaryLine } from "./OrderSummaryLine";

/** Sticky summary of the server-priced cart: lines, subtotal, shipping and total. */
export const OrderSummary = ({ quote }: { quote: CheckoutQuote | null }) => (
  <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-5 space-y-6 sticky top-28">
    <h2 className="font-display text-base font-bold uppercase text-ink">Đơn Hàng Của Bạn</h2>

    {quote ? (
      <div className="space-y-4">
        <div className="divide-y divide-ink/10 max-h-[26rem] overflow-y-auto pr-1">
          {quote.lines.map((line, i) => (
            <OrderSummaryLine key={i} line={line} />
          ))}
        </div>

        <div className="border-t border-ink/10 pt-4 space-y-2 text-xs text-ink/70">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span className="font-bold text-ink">{formatVND(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển</span>
            {quote.shippingFee === 0 ? (
              <span className="font-bold text-emerald-700">Miễn phí</span>
            ) : (
              <span className="font-bold text-ink">{formatVND(quote.shippingFee)}</span>
            )}
          </div>
          <div className="border-t border-ink/10 pt-3 flex justify-between items-baseline font-bold text-ink">
            <span className="text-sm uppercase font-display">Tổng cộng</span>
            <span className="text-2xl font-display">{formatVND(quote.total)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-cream p-4 text-[11px] text-ink/65 space-y-1.5 border border-ink/5">
          <p className="flex items-center gap-1.5 font-bold text-ink">
            <Truck size={14} className="text-brand-forest" />
            Giao hàng toàn quốc 2-4 ngày
          </p>
          <p>Hỗ trợ kiểm tra hàng khi nhận &amp; đổi size tận nơi trong 7 ngày.</p>
        </div>
      </div>
    ) : (
      <div className="py-8 text-center text-xs text-ink/50">Đang tính toán đơn hàng…</div>
    )}
  </div>
);

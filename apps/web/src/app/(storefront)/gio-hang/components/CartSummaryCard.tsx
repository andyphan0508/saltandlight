import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "@/components/Icons";
import type { Quote } from "../types";

export interface CartSummaryCardProps {
  quote: Quote | null;
  subtotal: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  isCouponApplied: boolean;
  setIsCouponApplied: (applied: boolean) => void;
}

export const CartSummaryCard = ({
  quote,
  subtotal,
  couponCode,
  setCouponCode,
  isCouponApplied,
  setIsCouponApplied,
}: CartSummaryCardProps) => {
  const shippingFee = quote?.shippingFee ?? 0;
  const rawTotal = quote?.total ?? (subtotal + shippingFee);
  const discountAmount = isCouponApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = isCouponApplied ? Math.round(rawTotal - discountAmount) : rawTotal;

  const onApplyCoupon = () => {
    if (couponCode.toUpperCase() === "CHAO2026") {
      setIsCouponApplied(true);
    } else if (couponCode) {
      alert("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-5 space-y-6">
      <h2 className="font-display text-lg font-bold uppercase text-ink">
        Tóm Tắt Đơn Hàng
      </h2>

      {/* Pricing Breakdown */}
      <div className="space-y-3 text-sm text-ink/75">
        <div className="flex justify-between">
          <span>Tạm tính tiền hàng</span>
          <span className="font-bold text-ink">{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span>
            {shippingFee === 0 ? (
              <span className="font-bold text-emerald-700">Miễn phí</span>
            ) : (
              <span className="font-bold text-ink">{formatVND(shippingFee)}</span>
            )}
          </span>
        </div>

        {isCouponApplied && (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>Ưu đãi mã giảm giá (10%)</span>
            <span>-{formatVND(discountAmount)}</span>
          </div>
        )}

        <div className="border-t border-ink/10 pt-4 flex justify-between items-baseline">
          <span className="font-display font-bold text-base uppercase text-ink">Tổng thanh toán</span>
          <span className="font-display font-bold text-2xl text-ink">
            {formatVND(finalTotal)}
          </span>
        </div>
      </div>

      {/* Coupon Code Input */}
      <div className="pt-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã ưu đãi (CHAO2026)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 rounded-2xl border border-ink/15 px-3.5 py-2 text-xs font-medium uppercase placeholder-normal placeholder-ink/40 focus:border-ink focus:outline-none"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={onApplyCoupon}
          >
            Áp dụng
          </Button>
        </div>
        {isCouponApplied && (
          <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <Check size={14} />
            Đã áp dụng mã giảm giá 10%!
          </p>
        )}
      </div>

      {/* Checkout CTA */}
      <Link href="/thanh-toan" className="block pt-2">
        <Button variant="primary" size="lg" className="w-full shadow-lg hover:shadow-xl">
          <span>Tiến hành thanh toán</span>
          <ArrowRight size={18} />
        </Button>
      </Link>

      {/* Trust points */}
      <div className="border-t border-ink/10 pt-4 space-y-2 text-xs text-ink/60">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-brand-forest" />
          <span>Đổi size miễn phí trong 7 ngày nếu không vừa vặn</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-brand-forest" />
          <span>Được kiểm tra hàng tận tay trước khi thanh toán (COD)</span>
        </div>
      </div>
    </div>
  );
};

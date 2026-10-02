"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  X,
} from "@/components/Icons";
import { normalizeCouponCode } from "@/helpers/coupon";
import type { Quote } from "@/interfaces/cart";

export interface CartSummaryCardProps {
  quote: Quote | null;
  subtotal: number;
  /** The code kept in the cart; the quote says whether it applies and what it takes off. */
  couponCode: string;
  onCouponChange: (code: string) => void;
}

export const CartSummaryCard = ({
  quote,
  subtotal,
  couponCode,
  onCouponChange,
}: CartSummaryCardProps) => {
  const [draft, setDraft] = useState(couponCode);
  useEffect(() => setDraft(couponCode), [couponCode]);

  const shippingFee = quote?.shippingFee ?? 0;
  const discount = quote?.discount ?? 0;
  const finalTotal = quote?.total ?? subtotal + shippingFee;
  // Only the server's answer counts: a code shows as applied once the quote for it is back
  const coupon =
    quote?.coupon?.code === normalizeCouponCode(couponCode)
      ? quote.coupon
      : null;

  const onApplyCoupon = () => {
    const code = normalizeCouponCode(draft);
    if (code) onCouponChange(code);
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
              <span className="font-bold text-ink">
                {formatVND(shippingFee)}
              </span>
            )}
          </span>
        </div>

        {coupon?.isApplied && discount > 0 && (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>Mã giảm giá {coupon.code}</span>
            <span>-{formatVND(discount)}</span>
          </div>
        )}

        <div className="border-t border-ink/10 pt-4 flex justify-between items-baseline">
          <span className="font-display font-bold text-base uppercase text-ink">
            Tổng thanh toán
          </span>
          <span className="font-display font-bold text-2xl text-ink">
            {formatVND(finalTotal)}
          </span>
        </div>
      </div>

      {/* Coupon Code Input */}
      <div className="pt-2">
        {coupon?.isApplied ? (
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <Check size={14} />
              Đã áp dụng mã {coupon.code}
            </span>
            <button
              type="button"
              onClick={() => onCouponChange("")}
              className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-emerald-900 hover:bg-emerald-100"
            >
              <X size={12} />
              Bỏ mã
            </button>
          </div>
        ) : (
          <>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                onApplyCoupon();
              }}
            >
              <input
                type="text"
                placeholder="Nhập mã ưu đãi (Nếu có)"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={40}
                className="flex-1 rounded-2xl border border-ink/15 px-3.5 py-2 text-base sm:text-xs font-medium uppercase placeholder-normal placeholder-ink/40 focus:border-ink focus:outline-none"
              />
              <Button type="submit" variant="secondary" size="sm">
                Áp dụng
              </Button>
            </form>
            {coupon?.message && (
              <p className="mt-2 text-xs font-semibold text-sale">
                {coupon.message}
              </p>
            )}
          </>
        )}
      </div>

      {/* Checkout CTA */}
      <Link href="/thanh-toan" className="block pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-lg hover:shadow-xl"
        >
          <span>Tiến hành thanh toán</span>
          <ArrowRight size={18} />
        </Button>
      </Link>
    </div>
  );
};

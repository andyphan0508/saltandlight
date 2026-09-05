"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import { useCartStore } from "@/lib/cart-store";
import {
  ShoppingBag,
  Trash2,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Check,
} from "@/components/Icons";

const FREESHIP_THRESHOLD = 299000;

interface QuoteLine {
  productVariantId: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  color: string | null;
  size: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
}

interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export default function CartPage() {
  const cartLines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    if (cartLines.length === 0) {
      setQuote({ lines: [], subtotal: 0, shippingFee: 0, total: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartLines }),
    })
      .then((r) => r.json())
      .then(setQuote)
      .finally(() => setLoading(false));
  }, [cartLines]);

  const subtotal = quote?.subtotal ?? 0;
  const neededForFreeship = Math.max(0, FREESHIP_THRESHOLD - subtotal);
  const freeshipProgress = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100));

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-ink/60">Đang tải giỏ hàng của bạn…</p>
      </div>
    );
  }

  if (!quote || quote.lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint-100 text-brand-forest">
          <ShoppingBag size={36} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-black uppercase text-ink">
          Giỏ hàng của bạn đang trống
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Hãy khám phá các mẫu áo thun Lời Chúa và quà tặng ý nghĩa tại Salt &amp; Light nhé!
        </p>
        <div className="mt-8">
          <Link href="/san-pham">
            <Button variant="primary" size="lg" className="shadow-md">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-ink/10 pb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-ink">
          Giỏ Hàng Của Bạn ({quote.lines.reduce((s, l) => s + l.quantity, 0)} món)
        </h1>
      </div>

      {/* Free Shipping Progress Card */}
      <div className="rounded-3xl bg-mint-100 p-6 border border-mint-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Truck size={20} className="text-brand-forest flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-ink">
            {neededForFreeship === 0 ? (
              <span className="text-emerald-700">🎉 Chúc mừng! Bạn đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN toàn quốc!</span>
            ) : (
              <span>
                Mua thêm <strong>{formatVND(neededForFreeship)}</strong> để được <strong>FREESHIP toàn quốc</strong>!
              </span>
            )}
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full rounded-full bg-mint-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-forest transition-all duration-500"
            style={{ width: `${freeshipProgress}%` }}
          />
        </div>
      </div>

      {/* Main Cart Content */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Cart Item List */}
        <div className="space-y-4 lg:col-span-7">
          {quote.lines.map((line) => (
            <div
              key={line.productVariantId}
              className="flex gap-4 rounded-3xl bg-white p-4 sm:p-5 shadow-card border border-ink/5 items-center"
            >
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
                      onClick={() => setQuantity(line.productVariantId, line.quantity - 1)}
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
                        setQuantity(
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
                    onClick={() => remove(line.productVariantId)}
                    className="flex items-center gap-1 text-xs text-sale hover:underline transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>

              {/* Line Total */}
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-black text-ink">{formatVND(line.lineTotal)}</span>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-forest hover:underline"
            >
              ← Tiếp tục mua sắm thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-5 space-y-6">
          <h2 className="font-display text-lg font-black uppercase text-ink">
            Tóm Tắt Đơn Hàng
          </h2>

          {/* Pricing Breakdown */}
          <div className="space-y-3 text-sm text-ink/75">
            <div className="flex justify-between">
              <span>Tạm tính tiền hàng</span>
              <span className="font-bold text-ink">{formatVND(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span>
                {quote.shippingFee === 0 ? (
                  <span className="font-bold text-emerald-700">Miễn phí</span>
                ) : (
                  <span className="font-bold text-ink">{formatVND(quote.shippingFee)}</span>
                )}
              </span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Ưu đãi mã giảm giá (10%)</span>
                <span>-{formatVND(Math.round(quote.subtotal * 0.1))}</span>
              </div>
            )}

            <div className="border-t border-ink/10 pt-4 flex justify-between items-baseline">
              <span className="font-display font-black text-base uppercase text-ink">Tổng thanh toán</span>
              <span className="font-display font-black text-2xl text-ink">
                {formatVND(couponApplied ? Math.round(quote.total - quote.subtotal * 0.1) : quote.total)}
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
                onClick={() => {
                  if (couponCode.toUpperCase() === "CHAO2026") {
                    setCouponApplied(true);
                  } else if (couponCode) {
                    alert("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
                  }
                }}
              >
                Áp dụng
              </Button>
            </div>
            {couponApplied && (
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
      </div>
    </div>
  );
}

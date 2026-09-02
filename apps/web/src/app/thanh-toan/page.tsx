"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import { useCartStore } from "@/lib/cart-store";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Check,
} from "@/components/Icons";

interface Quote {
  subtotal: number;
  shippingFee: number;
  total: number;
  lines: { name: string; quantity: number; lineTotal: number; color?: string; size?: string }[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const cartLines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cartLines.length === 0) return;
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartLines }),
    })
      .then((r) => r.json())
      .then(setQuote);
  }, [cartLines]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      customer: {
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
      },
      shippingAddress: {
        recipientName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || ""),
        province: String(form.get("province") || ""),
        district: String(form.get("district") || ""),
        ward: String(form.get("ward") || ""),
        streetAddress: String(form.get("streetAddress") || ""),
      },
      note: String(form.get("note") || ""),
      items: cartLines,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ? JSON.stringify(data.error) : "Có lỗi xảy ra, vui lòng thử lại.");
        setSubmitting(false);
        return;
      }
      clearCart();
      const params = new URLSearchParams({
        total: String(data.total),
        transferContent: data.transferContent,
        ...(data.qrUrl ? { qrUrl: data.qrUrl } : {}),
      });
      router.push(`/don-hang/${data.orderNumber}?${params.toString()}`);
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
      setSubmitting(false);
    }
  }

  if (cartLines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint-100 text-brand-forest">
          <ShoppingBag size={36} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-black uppercase text-ink">
          Giỏ hàng đang trống
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Vui lòng chọn sản phẩm vào giỏ hàng trước khi thanh toán.
        </p>
        <div className="mt-8">
          <Link href="/san-pham">
            <Button variant="primary" size="lg">
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      {/* Checkout Steps */}
      <div className="border-b border-ink/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-ink">
            Thanh Toán Đơn Hàng
          </h1>
          <p className="text-xs text-ink/60 mt-1">
            Vui lòng điền thông tin người nhận để Salt &amp; Light giao hàng tận nơi.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-ink/40">
          <span className="text-brand-forest">1. Giỏ hàng</span>
          <span>→</span>
          <span className="rounded-full bg-ink px-3 py-1 text-white">2. Giao hàng &amp; Thanh toán</span>
          <span>→</span>
          <span>3. Hoàn tất</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Customer & Address Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 space-y-6">
            <h2 className="font-display text-base font-black uppercase text-ink flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint-200 text-xs text-brand-forest">
                1
              </span>
              Thông Tin Người Nhận
            </h2>

            <div className="space-y-4">
              <Field
                label="Họ và tên người nhận"
                name="fullName"
                placeholder="Ví dụ: Nguyễn Văn A"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Số điện thoại"
                  name="phone"
                  placeholder="0912 345 678"
                  type="tel"
                  required
                />
                <Field
                  label="Email (nhận hóa đơn & cập nhật)"
                  name="email"
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 space-y-6">
            <h2 className="font-display text-base font-black uppercase text-ink flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint-200 text-xs text-brand-forest">
                2
              </span>
              Địa Chỉ Giao Hàng
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field
                  label="Tỉnh / Thành phố"
                  name="province"
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  required
                />
                <Field
                  label="Quận / Huyện"
                  name="district"
                  placeholder="Ví dụ: Quận 1"
                  required
                />
                <Field
                  label="Phường / Xã"
                  name="ward"
                  placeholder="Ví dụ: Phường Bến Nghé"
                  required
                />
              </div>

              <Field
                label="Địa chỉ cụ thể (số nhà, tên đường, tòa nhà)"
                name="streetAddress"
                placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
                required
              />

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-ink/70">
                  Ghi chú cho shipper / Shop (Tùy chọn)
                </label>
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                  className="mt-1.5 w-full rounded-2xl border border-ink/15 p-3 text-sm focus:border-ink focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Info Box */}
          <div className="rounded-3xl bg-mint-50 p-6 border border-mint-200 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-forest flex items-center gap-2">
              <ShieldCheck size={16} />
              Phương Thức Thanh Toán VietQR Tự Động
            </h3>
            <p className="text-xs text-ink/75 leading-relaxed">
              Sau khi bấm <strong>Đặt Hàng</strong>, hệ thống sẽ tự động hiển thị mã <strong>VietQR Napas 24/7</strong> với số tiền và cú pháp chính xác. Bạn chỉ cần mở app ngân hàng bất kỳ để quét mã và chuyển khoản nhanh trong 30 giây.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-sm font-semibold text-sale">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="lg"
            className="w-full shadow-lg hover:shadow-xl py-4"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý đơn hàng…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Hoàn tất đặt hàng &amp; Lấy mã VietQR</span>
                <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-5 space-y-6 sticky top-28">
          <h2 className="font-display text-base font-black uppercase text-ink">
            Đơn Hàng Của Bạn
          </h2>

          {quote ? (
            <div className="space-y-4">
              <div className="divide-y divide-ink/10 max-h-80 overflow-y-auto pr-1">
                {quote.lines.map((l, i) => (
                  <div key={i} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-ink">{l.name}</span>
                      <div className="text-[11px] text-ink/50 mt-0.5">
                        Số lượng: {l.quantity}
                      </div>
                    </div>
                    <span className="font-semibold text-ink">{formatVND(l.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink/10 pt-4 space-y-2 text-xs text-ink/70">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
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
                <div className="border-t border-ink/10 pt-3 flex justify-between items-baseline font-black text-ink">
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
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-ink/70">
        {label} {required && <span className="text-sale">*</span>}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none transition-colors"
      />
    </div>
  );
}

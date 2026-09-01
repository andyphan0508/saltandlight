"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import { useCartStore } from "@/lib/cart-store";

interface Quote {
  subtotal: number;
  shippingFee: number;
  total: number;
  lines: { name: string; quantity: number; lineTotal: number }[];
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
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-black uppercase">Giỏ hàng trống</h1>
        <Link href="/san-pham" className="mt-6 inline-block">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-black uppercase">Thanh toán</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          <Field label="Họ và tên" name="fullName" required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Số điện thoại" name="phone" required />
            <Field label="Email (tùy chọn)" name="email" type="email" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Tỉnh/Thành phố" name="province" required />
            <Field label="Quận/Huyện" name="district" required />
            <Field label="Phường/Xã" name="ward" required />
          </div>
          <Field label="Địa chỉ cụ thể (số nhà, tên đường)" name="streetAddress" required />
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink/60">Ghi chú</label>
            <textarea
              name="note"
              rows={3}
              className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
            />
          </div>

          {error && <p className="text-sm text-sale">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Đang xử lý…" : "Đặt hàng"}
          </Button>
          <p className="text-xs text-ink/50">
            Sau khi đặt hàng, bạn sẽ nhận được mã QR để chuyển khoản ngân hàng. Đơn hàng được
            xử lý sau khi shop xác nhận đã nhận thanh toán.
          </p>
        </form>

        <div className="h-fit rounded-2xl bg-mint-100 p-6">
          <h2 className="text-sm font-bold uppercase">Đơn hàng của bạn</h2>
          {quote ? (
            <div className="mt-4 space-y-2 text-sm">
              {quote.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-ink/70">
                  <span>
                    {l.name} × {l.quantity}
                  </span>
                  <span>{formatVND(l.lineTotal)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-ink/10 pt-2">
                <span>Tạm tính</span>
                <span>{formatVND(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển</span>
                <span>{quote.shippingFee === 0 ? "Miễn phí" : formatVND(quote.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2 font-semibold">
                <span>Tổng cộng</span>
                <span>{formatVND(quote.total)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/50">Đang tính…</p>
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
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-ink/60">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
      />
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import { Truck, Search, Phone, Check, ShieldCheck, Sparkles } from "@/components/Icons";

const STATUS_LABEL: Record<string, { label: string; bg: string }> = {
  pending_payment: { label: "Chờ thanh toán", bg: "bg-amber-100 text-amber-900 border-amber-200" },
  processing: { label: "Đang xử lý & Đóng gói", bg: "bg-blue-100 text-blue-900 border-blue-200" },
  on_hold: { label: "Tạm giữ", bg: "bg-orange-100 text-orange-900 border-orange-200" },
  completed: { label: "Giao hàng thành công", bg: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  cancelled: { label: "Đã hủy", bg: "bg-rose-100 text-rose-900 border-rose-200" },
  refunded: { label: "Đã hoàn tiền", bg: "bg-zinc-100 text-zinc-900 border-zinc-200" },
};

interface OrderResult {
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  items: { productNameSnapshot: string; color: string | null; size: string | null; quantity: number; unitPrice: string }[];
  statusHistory: { toStatus: string; changedAt: string; note: string | null }[];
}

export default function TrackOrderPage() {
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: String(form.get("orderNumber") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại.");
      return;
    }
    setResult(data.order);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 text-brand-forest shadow-sm">
          <Truck size={28} />
        </div>
        <h1 className="font-display text-3xl font-black uppercase text-ink">
          Tra Cứu Đơn Hàng
        </h1>
        <p className="text-sm text-ink/70 max-w-md mx-auto">
          Nhập mã đơn hàng và số điện thoại đặt hàng để theo dõi tiến độ xử lý và vận chuyển.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink/70">
              Mã đơn hàng
            </label>
            <input
              name="orderNumber"
              placeholder="Ví dụ: SL-2026-000142"
              required
              className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink/70">
              Số điện thoại đặt hàng
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Ví dụ: 0912345678"
              required
              className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-sale border border-rose-200">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} variant="primary" size="md" className="w-full shadow-md">
            {loading ? "Đang tra cứu…" : "Kiểm tra tiến độ đơn hàng"}
          </Button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4">
            <div>
              <span className="text-xs text-ink/50 uppercase font-semibold">Mã đơn hàng</span>
              <h2 className="font-display text-xl font-black uppercase text-ink">
                #{result.orderNumber}
              </h2>
            </div>
            <span
              className={`rounded-full border px-4 py-1 text-xs font-black uppercase tracking-wider ${
                STATUS_LABEL[result.status]?.bg ?? "bg-ink text-white"
              }`}
            >
              {STATUS_LABEL[result.status]?.label ?? result.status}
            </span>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-3">
              Chi tiết sản phẩm
            </h3>
            <div className="divide-y divide-ink/10">
              {result.items.map((item, i) => (
                <div key={i} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-ink">{item.productNameSnapshot}</span>
                    <div className="text-[11px] text-ink/50 mt-0.5">
                      Phân loại: {[item.color, item.size].filter(Boolean).join(" / ")} • Số lượng: {item.quantity}
                    </div>
                  </div>
                  <span className="font-bold text-ink">{formatVND(item.unitPrice)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 font-black text-ink">
              <span className="text-sm uppercase font-display">Tổng giá trị đơn</span>
              <span className="text-xl font-display">{formatVND(result.total)}</span>
            </div>
          </div>

          {/* Timeline History */}
          <div className="border-t border-ink/10 pt-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-4">
              Lịch sử trạng thái đơn hàng
            </h3>
            <ul className="space-y-3 text-xs">
              {result.statusHistory.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-mint-200 text-brand-forest mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <span className="font-bold text-ink">
                      {STATUS_LABEL[h.toStatus]?.label ?? h.toStatus}
                    </span>
                    <p className="text-[11px] text-ink/50">
                      {new Date(h.changedAt).toLocaleString("vi-VN")}
                      {h.note ? ` — ${h.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Support Box */}
      <div className="rounded-3xl bg-mint-50/70 p-6 border border-mint-200 text-center text-xs text-ink/70">
        <p className="font-bold text-ink">Bạn cần trợ giúp hoặc thay đổi thông tin giao hàng?</p>
        <p className="mt-1">
          Liên hệ ngay hotline/Zalo <strong>0847 25 2025</strong> hoặc gửi email về{" "}
          <strong>saltandlight.lienhe@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  processing: "Đang xử lý",
  on_hold: "Tạm giữ",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
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
        orderNumber: String(form.get("orderNumber") || ""),
        phone: String(form.get("phone") || ""),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Có lỗi xảy ra");
      return;
    }
    setResult(data.order);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-center font-display text-2xl font-black uppercase">Tra cứu đơn hàng</h1>
      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-sm space-y-4">
        <input
          name="orderNumber"
          placeholder="Mã đơn hàng (VD: SL-2026-000142)"
          required
          className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
        />
        <input
          name="phone"
          placeholder="Số điện thoại đặt hàng"
          required
          className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Đang tìm…" : "Tra cứu"}
        </Button>
        {error && <p className="text-center text-sm text-sale">{error}</p>}
      </form>

      {result && (
        <div className="mt-10 rounded-2xl bg-mint-100 p-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{result.orderNumber}</span>
            <span className="rounded-pill bg-ink px-3 py-1 text-xs font-semibold uppercase text-white">
              {STATUS_LABEL[result.status] ?? result.status}
            </span>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {result.items.map((item, i) => (
              <div key={i} className="flex justify-between text-ink/70">
                <span>
                  {item.productNameSnapshot} ({[item.color, item.size].filter(Boolean).join(" / ")}) ×{" "}
                  {item.quantity}
                </span>
                <span>{formatVND(item.unitPrice)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-ink/10 pt-3 font-semibold">
            <span>Tổng cộng</span>
            <span>{formatVND(result.total)}</span>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase text-ink/60">Lịch sử đơn hàng</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink/70">
              {result.statusHistory.map((h, i) => (
                <li key={i}>
                  {new Date(h.changedAt).toLocaleString("vi-VN")} — {STATUS_LABEL[h.toStatus] ?? h.toStatus}
                  {h.note ? ` (${h.note})` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

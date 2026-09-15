"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVND, ORDER_STATUS_LABELS } from "@saltandlight/domain";
import { ArrowRight, ChevronDown, Clock, Copy } from "@/components/Icons";
import { STOREFRONT_ORDER_STATUS_CLASS } from "@/helpers/order-status-styles";
import type { CustomerOrder } from "@/interfaces/customer-order";
import { OrderTimeline } from "./OrderTimeline";

const formatOrderDate = (value: string) =>
  new Date(value).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

/** One order: number (copyable), date, status, items, total and an expandable status history. */
export const OrderCard = ({ order }: { order: CustomerOrder }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const hasHistory = order.statusHistory?.length > 0;

  const onCopy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(order.orderNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-card border border-ink/5 space-y-4 transition-all hover:border-ink/15">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/5 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm sm:text-base text-ink">#{order.orderNumber}</span>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-lg p-1 text-ink/40 hover:bg-ink/5 hover:text-ink transition-colors"
              title="Sao chép mã đơn"
              aria-label="Sao chép mã đơn"
            >
              <Copy size={13} />
            </button>
            {isCopied && <span className="text-[10px] font-bold text-emerald-600 animate-pop-in">Đã chép!</span>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink/50">
            <Clock size={12} />
            <span>{formatOrderDate(order.createdAt)}</span>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
            STOREFRONT_ORDER_STATUS_CLASS[order.status] ?? "bg-zinc-100 text-zinc-800 border-zinc-200"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span>{ORDER_STATUS_LABELS[order.status] ?? "Đang xử lý"}</span>
        </span>
      </div>

      <div className="space-y-2.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-cream-50/70 p-3 text-xs">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink truncate">{item.productNameSnapshot}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink/50">
                {item.color && (
                  <span>
                    Màu: <strong className="text-ink/80">{item.color}</strong>
                  </span>
                )}
                {item.color && item.size && <span>•</span>}
                {item.size && (
                  <span>
                    Size: <strong className="text-ink/80">{item.size}</strong>
                  </span>
                )}
                <span>•</span>
                <span>
                  SL: <strong className="text-ink/80">x{item.quantity}</strong>
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 font-bold text-ink">{formatVND(item.unitPrice * item.quantity)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 pt-4">
        <div>
          <span className="text-xs text-ink/60">Tổng thanh toán: </span>
          <span className="font-display font-bold text-base text-ink sm:text-lg">{formatVND(order.total)}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasHistory && (
            <button
              type="button"
              onClick={() => setIsHistoryOpen((v) => !v)}
              aria-expanded={isHistoryOpen}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-forest hover:bg-mint-50 transition-colors"
            >
              <span>Lịch sử xử lý</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isHistoryOpen ? "rotate-180" : ""}`} />
            </button>
          )}
          <Link
            href={`/don-hang/${order.orderNumber}`}
            className="inline-flex items-center gap-1 rounded-xl bg-ink px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-ink-800 transition-colors active-press"
          >
            <span>Xem chi tiết</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {isHistoryOpen && hasHistory && <OrderTimeline steps={order.statusHistory} />}
    </div>
  );
};

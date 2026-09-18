"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { normalizeVietnamesePhone, smsHref } from "@/helpers/phone";
import { orderActionsFor, type OrderAction } from "@/helpers/order-actions";
import { Phone, MessageSquare } from "@/components/admin/Icons";

interface OrderActionsProps {
  orderId: string;
  orderNumber: string;
  status: string;
  awaitingPaymentId: string | null;
  customerPhone: string | null;
}

const TONE_CLASS: Record<OrderAction["tone"], string> = {
  primary: "bg-brand-forest text-white hover:bg-emerald-800 border-brand-forest",
  neutral: "bg-white text-ink hover:bg-slate-50 border-slate-200",
  danger: "bg-white text-rose-600 hover:bg-rose-50 border-rose-200",
};

/** One-click next steps for an order, plus direct call / Zalo to the customer. */
export const OrderActions = ({ orderId, orderNumber, status, awaitingPaymentId, customerPhone }: OrderActionsProps) => {
  const router = useRouter();
  const [pendingTo, setPendingTo] = useState<string | null>(null);
  const actions = orderActionsFor(status, Boolean(awaitingPaymentId));
  const phone = normalizeVietnamesePhone(customerPhone);

  const run = async (action: OrderAction) => {
    if (action.needsConfirm && !confirm(`${action.label} cho đơn ${orderNumber}?${action.to === "cancelled" ? " Tồn kho sẽ được cộng lại." : ""}`)) {
      return;
    }
    setPendingTo(action.to);
    try {
      if (action.via === "payment" && awaitingPaymentId) {
        await adminFetch(`/api/admin/payments/${awaitingPaymentId}/confirm`, { method: "PATCH" });
      } else {
        await adminFetch(`/api/admin/orders/${orderId}/status`, { method: "PATCH", body: { status: action.to } });
      }
      toast.success(`Đã cập nhật: ${action.label}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật đơn hàng");
    } finally {
      setPendingTo(null);
    }
  };

  return (
    <div className="space-y-3">
      {actions.length > 0 ? (
        <div className="grid gap-2">
          {actions.map((action) => (
            <button
              key={action.to + action.via}
              type="button"
              onClick={() => run(action)}
              disabled={pendingTo !== null}
              className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 ${TONE_CLASS[action.tone]}`}
            >
              {pendingTo === action.to ? "Đang cập nhật…" : action.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Đơn đã kết thúc, không còn bước xử lý nào.</p>
      )}

      {phone && (
        <div className="grid grid-cols-3 gap-2 border-t border-ink/10 pt-3">
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
          >
            <Phone size={14} /> Gọi khách
          </a>
          <a
            href={smsHref(phone, `Salt & Light: về đơn hàng ${orderNumber} của bạn, `)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <MessageSquare size={14} /> Nhắn SMS
          </a>
          <a
            href={`https://zalo.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            Nhắn Zalo
          </a>
        </div>
      )}
    </div>
  );
};

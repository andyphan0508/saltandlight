import type { OrderStatusValue } from "@saltandlight/domain";

/** Admin wording + badge/bar colors for order statuses (admin copy is shorter than the customer-facing ORDER_STATUS_LABELS). */
type AdminStatusStyle = { label: string; className: string; barClass: string };

export const ADMIN_ORDER_STATUS: Record<string, AdminStatusStyle> = {
  pending_payment: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 border-amber-200", barClass: "bg-amber-500" },
  processing: { label: "Đang xử lý", className: "bg-sky-50 text-sky-700 border-sky-200", barClass: "bg-sky-500" },
  on_hold: { label: "Tạm giữ", className: "bg-slate-100 text-slate-700 border-slate-200", barClass: "bg-slate-400" },
  completed: { label: "Hoàn tất", className: "bg-emerald-50 text-emerald-700 border-emerald-200", barClass: "bg-emerald-500" },
  cancelled: { label: "Đã hủy", className: "bg-slate-100 text-slate-500 border-slate-200", barClass: "bg-slate-300" },
  refunded: { label: "Đã hoàn tiền", className: "bg-rose-50 text-rose-700 border-rose-200", barClass: "bg-rose-500" },
} satisfies Record<OrderStatusValue, AdminStatusStyle>;

/** Storefront badge colors for order statuses (labels come from ORDER_STATUS_LABELS). */
export const STOREFRONT_ORDER_STATUS_CLASS: Record<string, string> = {
  pending_payment: "bg-amber-50 text-amber-800 border-amber-200/80",
  processing: "bg-blue-50 text-blue-800 border-blue-200/80",
  on_hold: "bg-orange-50 text-orange-800 border-orange-200/80",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200/80",
  refunded: "bg-zinc-100 text-zinc-700 border-zinc-200/80",
} satisfies Record<OrderStatusValue, string>;

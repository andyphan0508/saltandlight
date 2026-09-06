export type OrderStatusValue =
  | "pending_payment"
  | "processing"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "refunded";

/**
 * Single source of truth for customer-facing status wording — the codebase
 * previously had two different label sets (admin orders list vs. the guest
 * order-tracking page). This uses the guest-tracking page's friendlier
 * wording, since both are customer-facing.
 */
export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  pending_payment: "Chờ thanh toán",
  processing: "Đang xử lý & Đóng gói",
  on_hold: "Tạm giữ",
  completed: "Giao hàng thành công",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

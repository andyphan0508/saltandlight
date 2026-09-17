import type { OrderStatusValue } from "@saltandlight/domain";

export interface OrderAction {
  to: OrderStatusValue;
  label: string;
  tone: "primary" | "neutral" | "danger";
  /** Destructive or hard to undo — ask before sending. */
  needsConfirm: boolean;
  /** "payment" confirms the pending bank transfer (which also moves the order and emails the customer). */
  via: "payment" | "status";
}

/** Statuses that still await the shop's action — what the admin order inbox counts. */
export const ACTIONABLE_ORDER_STATUSES: OrderStatusValue[] = ["pending_payment", "processing", "on_hold"];

const cancel: OrderAction = { to: "cancelled", label: "Hủy đơn", tone: "danger", needsConfirm: true, via: "status" };
const hold: OrderAction = { to: "on_hold", label: "Tạm giữ", tone: "neutral", needsConfirm: false, via: "status" };

/** The next sensible steps for an order, most likely first. Terminal orders offer nothing. */
export const orderActionsFor = (status: string, hasAwaitingPayment: boolean): OrderAction[] => {
  switch (status) {
    case "pending_payment":
      return [
        hasAwaitingPayment
          ? { to: "processing", label: "Xác nhận đã nhận tiền", tone: "primary", needsConfirm: false, via: "payment" }
          : { to: "processing", label: "Bắt đầu xử lý", tone: "primary", needsConfirm: false, via: "status" },
        hold,
        cancel,
      ];
    case "processing":
      return [
        { to: "completed", label: "Đã giao thành công", tone: "primary", needsConfirm: false, via: "status" },
        hold,
        cancel,
      ];
    case "on_hold":
      return [{ to: "processing", label: "Tiếp tục xử lý", tone: "primary", needsConfirm: false, via: "status" }, cancel];
    case "completed":
      return [{ to: "refunded", label: "Hoàn tiền", tone: "danger", needsConfirm: true, via: "status" }];
    default:
      return [];
  }
};

/**
 * Placing an order takes stock out; only cancelling puts it back. A refund is
 * money, not goods — the item may never come back — so it keeps stock as is.
 * Returns +1 to restock, -1 to take stock out again, 0 to leave it.
 */
export const stockDirection = (from: string, to: string): 1 | -1 | 0 => {
  if (from === to) return 0;
  if (to === "cancelled") return 1;
  if (from === "cancelled") return -1;
  return 0;
};

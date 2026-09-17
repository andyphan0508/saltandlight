import type { OrderStatusValue } from "./order-status";

export const PAYMENT_METHODS = ["bank_transfer", "cod"] as const;
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  bank_transfer: "Chuyển khoản ngân hàng",
  cod: "Thanh toán khi nhận hàng (COD)",
};

/**
 * A transfer order waits for the money before the shop packs it; a COD order
 * has nothing to wait for, so it goes straight to the shop's processing queue.
 */
export const initialOrderStatus = (method: PaymentMethodValue): OrderStatusValue =>
  method === "cod" ? "processing" : "pending_payment";

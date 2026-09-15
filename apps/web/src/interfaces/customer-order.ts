import type { OrderStatusValue } from "@saltandlight/domain";

export interface CustomerOrderItem {
  productNameSnapshot: string;
  color: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusStep {
  toStatus: string;
  changedAt: string;
  note: string | null;
}

export interface CustomerOrder {
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  createdAt: string;
  items: CustomerOrderItem[];
  statusHistory: OrderStatusStep[];
}

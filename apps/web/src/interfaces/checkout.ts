export interface CheckoutQuoteLine {
  name: string;
  quantity: number;
  lineTotal: number;
  color?: string;
  size?: string;
}

export interface CheckoutQuote {
  subtotal: number;
  shippingFee: number;
  total: number;
  lines: CheckoutQuoteLine[];
}

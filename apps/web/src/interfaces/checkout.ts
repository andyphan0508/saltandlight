export interface CheckoutQuoteLine {
  name: string;
  slug: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  color: string | null;
  colorHex: string | null;
  size: string | null;
}

export interface CheckoutQuote {
  subtotal: number;
  shippingFee: number;
  total: number;
  lines: CheckoutQuoteLine[];
}

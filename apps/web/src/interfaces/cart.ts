export interface QuoteLine {
  productVariantId: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  color: string | null;
  size: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
}

export interface QuoteCoupon {
  code: string;
  isApplied: boolean;
  /** Why the code doesn't apply to this cart; null when it does. */
  message: string | null;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  shippingFee: number;
  discount?: number;
  total: number;
  coupon?: QuoteCoupon | null;
}

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

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

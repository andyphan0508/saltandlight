export interface PromotionItem {
  id: string;
  name: string;
  badge: string | null;
  description: string | null;
  discountType: string;
  discountValue: number | string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  productIds: string[];
  createdAt: string;
}

export interface PromotionProductOption {
  id: string;
  name: string;
  minPrice: number | null;
}

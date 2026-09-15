export interface ProductCategoryOption {
  id: string;
  name: string;
}

export interface PromotionOption {
  id: string;
  name: string;
  badge: string | null;
  discountType: string;
  discountValue: number | string;
}

export interface VariantRow {
  id?: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface ImageRow {
  url: string;
  sortOrder: number;
}

export interface ProductFormInitial {
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  status: "draft" | "published" | "archived";
  isNew: boolean;
  isFeatured?: boolean;
  images: ImageRow[];
  variants: VariantRow[];
}

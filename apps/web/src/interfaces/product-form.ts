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

/** A color the admin created in the picker: a name plus the hex it renders as. */
export interface ColorChoice {
  name: string;
  hex: string;
}

export interface VariantRow {
  id?: string;
  sku: string;
  color: string;
  /** "" when the variant predates the color picker. */
  colorHex: string;
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
  /** Every category the product is listed in, including the primary. */
  categoryIds: string[];
  status: "draft" | "published" | "archived";
  isNew: boolean;
  isFeatured?: boolean;
  images: ImageRow[];
  variants: VariantRow[];
}

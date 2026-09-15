export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  isNew: boolean;
  isFeatured?: boolean;
  imageUrl: string | null;
  minPrice: number;
  maxCompareAtPrice: number | null;
}

export interface BannerData {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  bgGradient: string | null;
  sortOrder: number;
  isActive: boolean;
}

/** A category shown in the catalog filters, with its published product count. */
export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  count: number;
}

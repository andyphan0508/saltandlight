export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  isNew: boolean;
  imageUrl: string | null;
  minPrice: number;
  maxCompareAtPrice: number | null;
}

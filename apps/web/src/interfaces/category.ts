export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  _count?: { products: number };
}

export interface ParentCategoryOption {
  id: string;
  name: string;
  parentId: string | null;
}

export interface CategoryStats {
  totalCategories: number;
  totalProducts: number;
  topLevelCategories: number;
}

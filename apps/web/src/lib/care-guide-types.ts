export interface CareGuideItem {
  icon: string;
  title: string;
  content: string;
}

export interface CareGuide {
  id: string;
  title: string;
  subtitle?: string;
  scopeType: "category" | "product" | "all";
  categoryIds: string[];
  categorySlugs?: string[];
  productIds: string[];
  items: CareGuideItem[];
  isActive: boolean;
  sortOrder: number;
}

export const DEFAULT_CARE_GUIDES: CareGuide[] = [
  {
    id: "default-shirt-care",
    title: "Hướng Dẫn Giặt Ủi & Bảo Quản Áo Thun",
    subtitle: "Áp dụng cho các dòng áo thun 100% Cotton cao cấp từ Salt & Light",
    scopeType: "category",
    categoryIds: [],
    categorySlugs: ["ao-thun-nguoi-lon", "ao-thun-cho-be"],
    productIds: [],
    items: [
      {
        icon: "Soap",
        title: "Giặt áo đúng cách",
        content: "Nên lộn trái áo trước khi giặt. Ưu tiên giặt nước lạnh hoặc ấm dưới 30°C. Không ngâm quá 15 phút với bột giặt có chất tẩy mạnh.",
      },
      {
        icon: "Sun",
        title: "Phơi nơi râm mát",
        content: "Vũ nhẹ áo và phơi ngang ở nơi thoáng gió, bóng râm mát. Tránh phơi trực tiếp dưới nắng gắt gắt để giữ màu vải luôn tươi sáng.",
      },
      {
        icon: "Iron",
        title: "Ủi & Là hơi an toàn",
        content: "Ủi ở nhiệt độ trung bình. Tuyệt đối không ủi bàn là nóng trực tiếp lên bề mặt hình in (nên ủi mặt trái hoặc lót vải mỏng).",
      },
      {
        icon: "Shield",
        title: "Bảo vệ hình in DTG",
        content: "Không vặn xoắn mạnh tay trực tiếp ngay vị trí hình in. Treo bằng móc áo vừa vặn để giữ form cổ áo luôn chuẩn đẹp.",
      },
    ],
    isActive: true,
    sortOrder: 0,
  },
];

/**
 * Resolves the best-matching active CareGuide for a given product.
 */
export function resolveProductCareGuide(
  product: {
    id: string;
    categoryId?: string | null;
    category?: { id?: string; slug?: string } | null;
  },
  guides: CareGuide[] = []
): CareGuide | null {
  const activeGuides = guides
    .filter((g) => g.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (activeGuides.length === 0) return null;

  const categoryId = product.categoryId || product.category?.id;
  const categorySlug = product.category?.slug;

  // 1. Highest priority: Explicit product match
  const productMatch = activeGuides.find(
    (g) => g.scopeType === "product" && g.productIds?.includes(product.id)
  );
  if (productMatch) return productMatch;

  // 2. Category match
  const categoryMatch = activeGuides.find((g) => {
    if (g.scopeType !== "category") return false;
    if (categoryId && g.categoryIds?.includes(categoryId)) return true;
    if (categorySlug && g.categorySlugs?.includes(categorySlug)) return true;
    return false;
  });
  if (categoryMatch) return categoryMatch;

  // 3. Fallback: "all" products
  const allMatch = activeGuides.find((g) => g.scopeType === "all");
  if (allMatch) return allMatch;

  return null;
}

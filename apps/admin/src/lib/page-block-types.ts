export const PAGE_BLOCK_TYPES = [
  "FEATURE_CARDS",
  "FEATURED_PRODUCTS",
  "STORY_BANNER",
  "PROMO_CTA",
  "TESTIMONIALS",
  "PAGE_HERO",
  "RICH_TEXT_SECTIONS",
  "CONTACT_INFO",
  "CTA_BANNER",
] as const;

export type PageBlockTypeValue = (typeof PAGE_BLOCK_TYPES)[number];

export const BLOCK_TYPE_LABELS: Record<PageBlockTypeValue, string> = {
  FEATURE_CARDS: "Danh sách thẻ tính năng",
  FEATURED_PRODUCTS: "Sản phẩm nổi bật",
  STORY_BANNER: "Banner câu chuyện / Kinh Thánh",
  PROMO_CTA: "Banner khuyến mãi / đặt theo yêu cầu",
  TESTIMONIALS: "Đánh giá khách hàng",
  PAGE_HERO: "Tiêu đề đầu trang",
  RICH_TEXT_SECTIONS: "Nội dung chi tiết nhiều mục",
  CONTACT_INFO: "Thông tin liên hệ",
  CTA_BANNER: "Banner kêu gọi hành động",
};

/** Icon keys that resolve in both the admin picker and the storefront's block renderer — keep in sync with apps/web/src/components/Icons.tsx. */
export const BLOCK_ICON_KEYS = [
  "Truck",
  "ShieldCheck",
  "RefreshCw",
  "Heart",
  "Sparkles",
  "CrossIcon",
  "Star",
  "Gift",
  "Phone",
  "Mail",
  "MapPin",
  "Check",
] as const;

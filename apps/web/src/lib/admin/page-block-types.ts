export const PAGE_BLOCK_TYPES = [
  "FEATURED_PRODUCTS",
  "PRODUCT_LIST",
  "FEATURE_CARDS",
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
  FEATURED_PRODUCTS: "Sản phẩm nổi bật (Bán chạy / Nổi bật nhất)",
  PRODUCT_LIST: "Danh sách sản phẩm (Theo danh mục / Bộ sưu tập theo mùa)",
  FEATURE_CARDS: "Khung tiện ích, cam kết & Quy trình các bước",
  STORY_BANNER: "Khung câu chuyện thương hiệu & Lời Chúa",
  PROMO_CTA: "Khung ưu đãi / Đặt in áo & quà tặng theo yêu cầu",
  TESTIMONIALS: "Khối cảm nhận & Đánh giá của khách hàng",
  PAGE_HERO: "Phần mở đầu trang (Tiêu đề lớn & Giới thiệu)",
  RICH_TEXT_SECTIONS: "Bài viết giới thiệu chi tiết nhiều mục",
  CONTACT_INFO: "Thông tin liên hệ (Hotline, Zalo, Địa chỉ, Email)",
  CTA_BANNER: "Khung kêu gọi đặt mua hàng ngay",
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

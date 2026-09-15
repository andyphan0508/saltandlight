/** Storefront pages built from page blocks and editable in the Live Editor: the single list of slugs, labels and paths. */
export const MANAGED_PAGES = [
  { slug: "home", label: "Trang chủ", path: "/" },
  { slug: "gioi-thieu", label: "Giới thiệu", path: "/gioi-thieu" },
  { slug: "lien-he", label: "Liên hệ", path: "/lien-he" },
  { slug: "chinh-sach", label: "Chính sách", path: "/chinh-sach" },
  { slug: "dat-theo-yeu-cau", label: "Đặt theo yêu cầu", path: "/dat-theo-yeu-cau" },
] as const;

export type ManagedPageSlug = (typeof MANAGED_PAGES)[number]["slug"];

import { NAV_LEFT, NAV_RIGHT } from "./nav-items";

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface FooterSocialLink {
  platform: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  items: NavLinkItem[];
}

export type LogoSize = "sm" | "md" | "lg";

import { DEFAULT_CARE_GUIDES, type CareGuide } from "./care-guide-types";

export interface HeaderNavItems {
  left: NavLinkItem[];
  right: NavLinkItem[];
}

export interface SiteSettingsData {
  logoUrl: string;
  logoSize: LogoSize;
  footerLogoUrl: string;
  faviconUrl: string | null;
  headerNavItems: HeaderNavItems;
  footerBrandText: string;
  footerPhone: string;
  footerEmail: string;
  footerAddress: string;
  footerSocialLinks: FooterSocialLink[];
  footerColumns: FooterColumn[];
  careGuides: CareGuide[];
}

/**
 * Every value here is the exact content currently hardcoded in Header.tsx /
 * Footer.tsx / MobileDrawer.tsx. A brand-new `site_settings` row (or any
 * null field on it) falls back to these, so shipping this feature changes
 * nothing visually until an admin actually edits something.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  logoUrl: "/images/logo.png",
  logoSize: "md",
  footerLogoUrl: "/images/logo.png",
  faviconUrl: null,
  headerNavItems: {
    left: NAV_LEFT,
    right: NAV_RIGHT,
  },
  footerBrandText:
    'Thời trang & quà tặng Cơ Đốc — chúng mình mong muốn mang Lời Chúa len lỏi vào từng khoảnh khắc thường nhật, là "muối" mặn mà và "ánh sáng" soi rọi yêu thương.',
  footerPhone: "(+84) 847 25 2025",
  footerEmail: "saltandlight.lienhe@gmail.com",
  footerAddress: "Hồ Chí Minh, Việt Nam",
  footerSocialLinks: [
    { platform: "Facebook", url: "https://www.facebook.com/profile.php?id=61567842338156" },
    { platform: "TikTok", url: "https://www.tiktok.com/@aothun_saltandlight?_t=8rnA8OkmCd6&_r=1" },
  ],
  footerColumns: [
    {
      title: "Về Chúng Tôi",
      items: [
        { label: "Giới thiệu", href: "/gioi-thieu" },
        { label: "Liên hệ", href: "/lien-he" },
        { label: "Chính sách đổi trả", href: "/chinh-sach" },
        { label: "Tra cứu đơn hàng", href: "/tra-cuu-don-hang" },
      ],
    },
    {
      title: "Sản Phẩm",
      items: [
        { label: "Tất cả sản phẩm", href: "/san-pham" },
        { label: "Áo thun người lớn", href: "/san-pham?categories=ao-thun-nguoi-lon" },
        { label: "Áo thun cho bé", href: "/san-pham?categories=ao-thun-cho-be" },
        { label: "Túi tote canvas", href: "/san-pham?categories=tui-tote-canvas" },
      ],
    },
    {
      title: "Đặt Theo Yêu Cầu",
      items: [
        { label: "Đặt số lượng lớn", href: "/dat-theo-yeu-cau" },
        { label: "Đặt in theo yêu cầu", href: "/dat-theo-yeu-cau" },
      ],
    },
  ],
  careGuides: DEFAULT_CARE_GUIDES,
};

/** Tailwind size classes for the header/footer logo, keyed by the admin-picked preset. */
export const LOGO_SIZE_CLASSES: Record<LogoSize, { header: string; footer: string }> = {
  sm: {
    header: "h-9 sm:h-11 lg:h-12 w-32 sm:w-44 lg:w-48",
    footer: "h-9 w-36",
  },
  md: {
    header: "h-11 sm:h-14 lg:h-16 w-40 sm:w-56 lg:w-60",
    footer: "h-11 w-44",
  },
  lg: {
    header: "h-14 sm:h-16 lg:h-20 w-48 sm:w-64 lg:w-72",
    footer: "h-14 w-56",
  },
};

/** Merges a (possibly partial/null) DB row with the hardcoded defaults above. */
export function resolveSiteSettings(row?: {
  logoUrl?: string | null;
  logoSize?: string | null;
  footerLogoUrl?: string | null;
  faviconUrl?: string | null;
  headerNavItems?: unknown;
  footerBrandText?: string | null;
  footerPhone?: string | null;
  footerEmail?: string | null;
  footerAddress?: string | null;
  footerSocialLinks?: unknown;
  footerColumns?: unknown;
  careGuides?: unknown;
} | null): SiteSettingsData {
  if (!row) return DEFAULT_SITE_SETTINGS;
  const logoSize: LogoSize =
    row.logoSize === "sm" || row.logoSize === "md" || row.logoSize === "lg"
      ? row.logoSize
      : DEFAULT_SITE_SETTINGS.logoSize;

  return {
    logoUrl: row.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl,
    logoSize,
    footerLogoUrl: row.footerLogoUrl || row.logoUrl || DEFAULT_SITE_SETTINGS.footerLogoUrl,
    faviconUrl: row.faviconUrl || null,
    headerNavItems: (row.headerNavItems as HeaderNavItems) || DEFAULT_SITE_SETTINGS.headerNavItems,
    footerBrandText: row.footerBrandText || DEFAULT_SITE_SETTINGS.footerBrandText,
    footerPhone: row.footerPhone || DEFAULT_SITE_SETTINGS.footerPhone,
    footerEmail: row.footerEmail || DEFAULT_SITE_SETTINGS.footerEmail,
    footerAddress: row.footerAddress || DEFAULT_SITE_SETTINGS.footerAddress,
    footerSocialLinks: (row.footerSocialLinks as FooterSocialLink[]) || DEFAULT_SITE_SETTINGS.footerSocialLinks,
    footerColumns: (row.footerColumns as FooterColumn[]) || DEFAULT_SITE_SETTINGS.footerColumns,
    careGuides:
      Array.isArray(row.careGuides) && row.careGuides.length > 0
        ? (row.careGuides as CareGuide[])
        : DEFAULT_CARE_GUIDES,
  };
}

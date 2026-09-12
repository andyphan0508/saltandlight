import { z } from "zod";

/** Shared minimum bar for any admin/staff account password — these accounts have full backend access. */
export const adminPasswordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[a-zA-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số");

export const variantInputSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  stockQuantity: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
});

export const productInputSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ"),
  description: z.string().max(10000).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  images: z.array(z.object({ url: z.string().url(), sortOrder: z.number().int() })),
  variants: z.array(variantInputSchema).min(1),
});
export type ProductInput = z.infer<typeof productInputSchema>;

// ── Page content blocks ────────────────────────────────────────────

export const PAGE_SLUGS = ["home", "gioi-thieu", "lien-he", "chinh-sach", "dat-theo-yeu-cau"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

const featureCardItemSchema = z.object({
  icon: z.string().min(1).optional(),
  number: z.string().optional(),
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề mục"),
  description: z.string().trim().min(1, "Vui lòng nhập nội dung mô tả"),
});

const featureCardsContentSchema = z.object({
  style: z.enum(["row", "card", "numbered"]).default("row"),
  headline: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(featureCardItemSchema).min(1, "Cần có ít nhất 1 mục hiển thị"),
});

const featuredProductsContentSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string().trim().min(1, "Vui lòng nhập tiêu đề chính của khối"),
  ctaLabel: z.string().default("Xem tất cả"),
  ctaHref: z.string().default("/san-pham"),
  count: z.number().int().min(1).max(36).default(8),
  sourceType: z.enum(["all", "category", "manual"]).default("all"),
  categoryId: z.string().nullable().optional(),
  categorySlug: z.string().optional(),
  categoryName: z.string().optional(),
  productIds: z.array(z.string()).default([]),
  displayMode: z.enum(["grid", "slider"]).default("grid"),
  allowViewAll: z.boolean().default(true),
  viewAllMode: z.enum(["link", "modal"]).default("link"),
});

const storyBannerContentSchema = z.object({
  icon: z.string().optional(),
  quote: z.string().trim().min(1, "Vui lòng nhập câu trích dẫn hoặc thông điệp"),
  quoteRef: z.string().optional(),
  body: z.string().trim().min(1, "Vui lòng nhập nội dung câu chuyện / giới thiệu chi tiết"),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

const promoCtaContentSchema = z.object({
  badge: z.string().optional(),
  icon: z.string().optional(),
  headline: z.string().trim().min(1, "Vui lòng nhập tiêu đề thông điệp"),
  body: z.string().trim().min(1, "Vui lòng nhập nội dung mô tả"),
  bullets: z.array(z.string()).default([]),
  ctaLabel: z.string().trim().min(1, "Vui lòng nhập chữ trên nút bấm"),
  ctaHref: z.string().trim().min(1, "Vui lòng nhập đường dẫn khi bấm nút"),
});

const testimonialItemSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên khách hàng"),
  role: z.string().optional(),
  rating: z.number().int().min(1).max(5).default(5),
  product: z.string().optional(),
  comment: z.string().trim().min(1, "Vui lòng nhập nhận xét của khách hàng"),
});

const testimonialsContentSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string().trim().min(1, "Vui lòng nhập tiêu đề khối cảm nhận"),
  items: z.array(testimonialItemSchema).min(1, "Cần có ít nhất 1 nhận xét của khách hàng"),
});

const pageHeroContentSchema = z.object({
  icon: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề lớn của trang"),
  subtitle: z.string().optional(),
  quote: z.string().optional(),
  quoteRef: z.string().optional(),
});

const richTextSectionSchema = z.object({
  heading: z.string().trim().min(1, "Vui lòng nhập tiêu đề phần này"),
  paragraphs: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  cards: z.array(z.object({ title: z.string().default(""), description: z.string().default("") })).default([]),
  style: z.enum(["default", "note"]).optional(),
});

const richTextSectionsContentSchema = z.object({
  sections: z.array(richTextSectionSchema).min(1, "Cần có ít nhất 1 phần nội dung"),
});

const contactInfoItemSchema = z.object({
  icon: z.string().min(1).default("Phone"),
  label: z.string().trim().min(1, "Vui lòng nhập tên kênh liên hệ"),
  value: z.string().trim().min(1, "Vui lòng nhập nội dung thông tin liên hệ"),
  note: z.string().optional(),
});

const contactInfoContentSchema = z.object({
  items: z.array(contactInfoItemSchema).min(1, "Cần có ít nhất 1 thông tin liên hệ"),
  quote: z.string().optional(),
  quoteRef: z.string().optional(),
});

const ctaBannerContentSchema = z.object({
  headline: z.string().trim().min(1, "Vui lòng nhập tiêu đề lời kêu gọi"),
  buttons: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Vui lòng nhập chữ trên nút bấm"),
        href: z.string().trim().min(1, "Vui lòng nhập đường dẫn liên kết"),
        variant: z.enum(["primary", "outline"]).default("primary"),
      }),
    )
    .min(1, "Cần có ít nhất 1 nút hành động"),
});

export const pageBlockContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("FEATURE_CARDS"), content: featureCardsContentSchema }),
  z.object({ type: z.literal("FEATURED_PRODUCTS"), content: featuredProductsContentSchema }),
  z.object({ type: z.literal("PRODUCT_LIST"), content: featuredProductsContentSchema }),
  z.object({ type: z.literal("STORY_BANNER"), content: storyBannerContentSchema }),
  z.object({ type: z.literal("PROMO_CTA"), content: promoCtaContentSchema }),
  z.object({ type: z.literal("TESTIMONIALS"), content: testimonialsContentSchema }),
  z.object({ type: z.literal("PAGE_HERO"), content: pageHeroContentSchema }),
  z.object({ type: z.literal("RICH_TEXT_SECTIONS"), content: richTextSectionsContentSchema }),
  z.object({ type: z.literal("CONTACT_INFO"), content: contactInfoContentSchema }),
  z.object({ type: z.literal("CTA_BANNER"), content: ctaBannerContentSchema }),
]);

export const pageBlockCreateSchema = z.object({
  page: z.enum(PAGE_SLUGS),
}).and(pageBlockContentSchema);

export const pageBlockUpdateSchema = z.object({
  isVisible: z.boolean().optional(),
  content: z.record(z.string(), z.any()).optional(),
});

export const pageBlockReorderSchema = z.object({
  page: z.enum(PAGE_SLUGS),
  orderedIds: z.array(z.string().min(1)).min(1),
});

// ── Payment settings ────────────────────────────────────────────────

export const paymentSettingsSchema = z.object({
  qrImageUrl: z.string().url().optional().nullable(),
  transferNote: z.string().max(2000).optional().nullable(),
  showThankYouOnly: z.boolean().default(false),
  thankYouMessage: z.string().max(500).optional().nullable(),
});
export type PaymentSettingsInput = z.infer<typeof paymentSettingsSchema>;

// ── Promotions ──────────────────────────────────────────────────────

const promotionDateSchema = z
  .string()
  .refine((v) => !isNaN(Date.parse(v)), "Ngày không hợp lệ")
  .optional()
  .nullable();

export const promotionCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập tên chương trình").max(200),
    badge: z.string().trim().max(100).optional().nullable(),
    description: z.string().trim().max(2000).optional().nullable(),
    discountType: z.enum(["percent", "fixed"]).default("percent"),
    discountValue: z.number().positive("Giá trị giảm giá không hợp lệ"),
    startDate: promotionDateSchema,
    endDate: promotionDateSchema,
    isActive: z.boolean().default(true),
    productIds: z.array(z.string().uuid()).default([]),
    applyPrices: z.boolean().default(false),
  })
  .refine((data) => data.discountType !== "percent" || data.discountValue <= 100, {
    message: "Phần trăm giảm giá không được vượt quá 100%",
    path: ["discountValue"],
  });
export type PromotionCreateInput = z.infer<typeof promotionCreateSchema>;

export const promotionUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập tên chương trình").max(200).optional(),
    badge: z.string().trim().max(100).optional().nullable(),
    description: z.string().trim().max(2000).optional().nullable(),
    discountType: z.enum(["percent", "fixed"]).optional(),
    discountValue: z.number().positive("Giá trị giảm giá không hợp lệ").optional(),
    startDate: promotionDateSchema,
    endDate: promotionDateSchema,
    isActive: z.boolean().optional(),
    productIds: z.array(z.string().uuid()).optional(),
    applyPrices: z.boolean().optional(),
  })
  .refine(
    (data) => data.discountType !== "percent" || data.discountValue === undefined || data.discountValue <= 100,
    { message: "Phần trăm giảm giá không được vượt quá 100%", path: ["discountValue"] },
  );
export type PromotionUpdateInput = z.infer<typeof promotionUpdateSchema>;

// ── Site settings (header/footer/logo/menu editor) ──────────────────

const hrefSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập đường dẫn")
  .refine((v) => v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://"), {
    message: "Đường dẫn phải bắt đầu bằng / hoặc http(s)://",
  });

const navLinkItemSchema = z.object({
  label: z.string().trim().min(1, "Vui lòng nhập tên mục").max(50),
  href: hrefSchema,
});

const footerColumnSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề cột").max(50),
  items: z.array(navLinkItemSchema).max(10),
});

export const siteSettingsSchema = z.object({
  // Logos can be a locally-served default (e.g. "/images/logo.png", the
  // fallback in DEFAULT_SITE_SETTINGS) or an uploaded Supabase Storage URL —
  // z.string().url() rejected the relative-path default outright, so every
  // save failed with "Invalid url" until a custom logo had been uploaded.
  logoUrl: hrefSchema.optional().nullable(),
  logoSize: z.enum(["sm", "md", "lg"]).default("md"),
  footerLogoUrl: hrefSchema.optional().nullable(),
  faviconUrl: hrefSchema.optional().nullable(),
  headerNavItems: z
    .object({
      left: z.array(navLinkItemSchema).max(8),
      right: z.array(navLinkItemSchema).max(8),
    })
    .optional()
    .nullable(),
  footerBrandText: z.string().trim().max(2000).optional().nullable(),
  footerPhone: z.string().trim().max(50).optional().nullable(),
  footerEmail: z.string().trim().max(200).optional().nullable(),
  footerAddress: z.string().trim().max(200).optional().nullable(),
  footerSocialLinks: z
    .array(z.object({ platform: z.string().trim().min(1).max(30), url: z.string().url() }))
    .max(10)
    .optional()
    .nullable(),
  footerColumns: z.array(footerColumnSchema).max(6).optional().nullable(),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

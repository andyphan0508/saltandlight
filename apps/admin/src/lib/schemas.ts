import { z } from "zod";

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

export const PAGE_SLUGS = ["home", "gioi-thieu", "lien-he", "chinh-sach"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

const featureCardItemSchema = z.object({
  icon: z.string().min(1).optional(),
  number: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
});

const featureCardsContentSchema = z.object({
  style: z.enum(["row", "card", "numbered"]).default("row"),
  headline: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(featureCardItemSchema).min(1),
});

const featuredProductsContentSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  count: z.number().int().min(1).max(24),
});

const storyBannerContentSchema = z.object({
  icon: z.string().optional(),
  quote: z.string().min(1),
  quoteRef: z.string().optional(),
  body: z.string().min(1),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

const promoCtaContentSchema = z.object({
  badge: z.string().optional(),
  icon: z.string().optional(),
  headline: z.string().min(1),
  body: z.string().min(1),
  bullets: z.array(z.string().min(1)).default([]),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
});

const testimonialItemSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  product: z.string().optional(),
  comment: z.string().min(1),
});

const testimonialsContentSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string().min(1),
  items: z.array(testimonialItemSchema).min(1),
});

const pageHeroContentSchema = z.object({
  icon: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  quote: z.string().optional(),
  quoteRef: z.string().optional(),
});

const richTextSectionSchema = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).default([]),
  bullets: z.array(z.string().min(1)).default([]),
  cards: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).default([]),
  style: z.enum(["default", "note"]).optional(),
});

const richTextSectionsContentSchema = z.object({
  sections: z.array(richTextSectionSchema).min(1),
});

const contactInfoItemSchema = z.object({
  icon: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  note: z.string().optional(),
});

const contactInfoContentSchema = z.object({
  items: z.array(contactInfoItemSchema).min(1),
  quote: z.string().optional(),
  quoteRef: z.string().optional(),
});

const ctaBannerContentSchema = z.object({
  headline: z.string().min(1),
  buttons: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
        variant: z.enum(["primary", "outline"]).default("primary"),
      }),
    )
    .min(1),
});

export const pageBlockContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("FEATURE_CARDS"), content: featureCardsContentSchema }),
  z.object({ type: z.literal("FEATURED_PRODUCTS"), content: featuredProductsContentSchema }),
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
  orderedIds: z.array(z.string().uuid()).min(1),
});

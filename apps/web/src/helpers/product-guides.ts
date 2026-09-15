import { z } from "zod";

/**
 * Category-level product guides: care instructions, size charts, highlights…
 * Admins manage them once per category (Admin → Hướng dẫn sản phẩm) and every
 * product in that category shows them, instead of repeating the same blocks
 * inside each product's description.
 *
 * Stored as one JSON array on the `site_settings` row (`care_guides` column —
 * the name predates the broader "guides" concept). Array order = display order.
 */

export const GUIDE_LAYOUTS = ["cards", "list", "table"] as const;
export type GuideLayout = (typeof GUIDE_LAYOUTS)[number];

const guideItemSchema = z.object({
  icon: z.string().trim().max(16).default(""),
  title: z.string().trim().max(120).default(""),
  content: z.string().trim().max(1000).default(""),
});

export const productGuideSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().trim().min(1, "Tiêu đề hướng dẫn không được để trống").max(120),
  subtitle: z.string().trim().max(240).default(""),
  layout: z.enum(GUIDE_LAYOUTS),
  categoryIds: z.array(z.string().uuid()).max(100),
  // Blank rows are meaningless on the storefront — drop them at the boundary.
  items: z
    .array(guideItemSchema)
    .max(30)
    .transform((items) => items.filter((item) => item.title || item.content)),
  isActive: z.boolean(),
});

export const productGuidesSchema = z.array(productGuideSchema).max(50);

export type ProductGuideItem = z.infer<typeof guideItemSchema>;
export type ProductGuide = z.infer<typeof productGuideSchema>;

/** Stored JSON → guides. Malformed data yields no guides rather than breaking the product page. */
export function parseProductGuides(raw: unknown): ProductGuide[] {
  const parsed = productGuidesSchema.safeParse(raw ?? []);
  if (!parsed.success) {
    console.error("[product-guides] Ignoring invalid stored guides:", parsed.error.issues[0]);
    return [];
  }
  return parsed.data;
}

/** Active guides assigned to a product's category or to that category's parent. */
export function guidesForCategory(
  guides: ProductGuide[],
  category: { id: string; parentId: string | null } | null | undefined,
): ProductGuide[] {
  if (!category) return [];
  // ponytail: checks the category and its direct parent only — walk the full ancestor chain if categories ever nest deeper than two levels.
  const ids = [category.id, category.parentId];
  return guides.filter((guide) => guide.isActive && guide.categoryIds.some((id) => ids.includes(id)));
}

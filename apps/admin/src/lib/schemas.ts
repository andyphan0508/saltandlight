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
  images: z.array(z.object({ url: z.string().url(), sortOrder: z.number().int() })),
  variants: z.array(variantInputSchema).min(1),
});
export type ProductInput = z.infer<typeof productInputSchema>;

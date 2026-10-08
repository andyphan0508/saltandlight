import { prisma } from "@saltandlight/db";
import { toPlain } from "@/helpers/serialize";
import type { ProductFormInitial } from "@/interfaces/product-form";

/** A saved product as the admin product form's starting values; null when it doesn't exist. */
export const loadProductFormInitial = async (id: string): Promise<ProductFormInitial | null> => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: true, categories: { select: { id: true } } },
  });
  if (!product) return null;

  const plain = toPlain(product);
  return {
    id: plain.id,
    name: plain.name,
    slug: plain.slug,
    description: plain.description ?? "",
    categoryId: plain.categoryId,
    categoryIds: plain.categories.map((c) => c.id),
    status: plain.status,
    isNew: plain.isNew,
    isFeatured: plain.isFeatured,
    images: plain.images.map((img) => ({
      url: img.url,
      sortOrder: img.sortOrder,
      color: img.color,
    })),
    variants: plain.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color ?? "",
      colorHex: v.colorHex ?? "",
      size: v.size ?? "",
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stockQuantity: v.stockQuantity,
      isActive: v.isActive,
    })),
  };
};

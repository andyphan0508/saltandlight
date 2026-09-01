import { prisma } from "@saltandlight/db";
import type { ProductCardData } from "./types";

export async function listPublishedProducts(opts: { categorySlug?: string } = {}): Promise<
  ProductCardData[]
> {
  const products = await prisma.product.findMany({
    where: {
      status: "published",
      ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true } },
    },
  });

  return products.map((p) => {
    const prices = p.variants.map((v) => Number(v.price));
    const compareAts = p.variants
      .map((v) => (v.compareAtPrice ? Number(v.compareAtPrice) : null))
      .filter((v): v is number => v != null);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      isNew: p.isNew,
      imageUrl: p.images[0]?.url ?? null,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxCompareAtPrice: compareAts.length ? Math.max(...compareAts) : null,
    };
  });
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "published" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
}

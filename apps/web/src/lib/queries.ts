import { prisma, Prisma } from "@saltandlight/db";
import type { ProductCardData } from "./types";

export type SortOption = "latest" | "price-asc" | "price-desc" | "name-asc";

export interface ProductListFilters {
  categorySlugs?: string[];
  sizes?: string[];
  onSale?: boolean;
  query?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

const SORT_ORDER_BY: Record<SortOption, Prisma.ProductOrderByWithRelationInput> = {
  latest: { createdAt: "desc" },
  "price-asc": { minPrice: "asc" },
  "price-desc": { minPrice: "desc" },
  "name-asc": { name: "asc" },
};

function toCardData(p: {
  id: string;
  name: string;
  slug: string;
  isNew: boolean;
  images: { url: string }[];
  minPrice: Prisma.Decimal | null;
  maxCompareAtPrice: Prisma.Decimal | null;
}): ProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    isNew: p.isNew,
    imageUrl: p.images[0]?.url ?? null,
    minPrice: p.minPrice ? Number(p.minPrice) : 0,
    maxCompareAtPrice: p.maxCompareAtPrice ? Number(p.maxCompareAtPrice) : null,
  };
}

/**
 * Filtering, sorting and pagination all happen at the DB level (indexed
 * columns — see packages/db/prisma/schema.prisma) so this scales the same
 * whether the catalog has 47 products or several thousand: only the current
 * page's rows, with a single joined image, ever come back over the wire.
 * Product-level `minPrice`/`maxCompareAtPrice` are a denormalized cache of
 * the variants (kept in sync on every write — see computePriceRange in
 * packages/domain) specifically so price sort doesn't need to touch the
 * variants table at read time.
 */
export async function listPublishedProducts(
  filters: ProductListFilters = {},
): Promise<{ products: ProductCardData[]; total: number }> {
  const { categorySlugs, sizes, onSale, query, sort = "latest", page = 1, pageSize = 12 } = filters;

  const where: Prisma.ProductWhereInput = {
    status: "published",
    ...(categorySlugs?.length ? { category: { slug: { in: categorySlugs } } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(sizes?.length ? { variants: { some: { isActive: true, size: { in: sizes } } } } : {}),
    ...(onSale ? { variants: { some: { isActive: true, compareAtPrice: { not: null } } } } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_ORDER_BY[sort],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        isNew: true,
        minPrice: true,
        maxCompareAtPrice: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products: rows.map(toCardData), total };
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

/** Category list with a live count of published products in each — for the sidebar filter. */
export async function listCategoriesWithCounts() {
  const [categories, counts, totalPublished] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { status: "published" },
      _count: { _all: true },
    }),
    prisma.product.count({ where: { status: "published" } }),
  ]);
  const countMap = new Map(counts.map((c) => [c.categoryId, c._count._all]));
  return {
    categories: categories.map((c) => ({ ...c, count: countMap.get(c.id) ?? 0 })),
    totalPublished,
  };
}

const SIZE_ORDER = ["XS (BABY)", "S (BABY)", "M (BABY)", "L (BABY)", "XS", "S", "M", "L", "XL", "XXL"];

/** Distinct sizes across active variants of published products — for the sidebar size filter. */
export async function listAvailableSizes(): Promise<string[]> {
  const rows = await prisma.productVariant.findMany({
    where: { isActive: true, size: { not: null }, product: { status: "published" } },
    select: { size: true },
    distinct: ["size"],
  });
  const sizes = rows.map((r) => r.size!).filter(Boolean);
  return sizes.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
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

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where: { status: "published", categoryId, id: { not: excludeId } },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isNew: true,
      minPrice: true,
      maxCompareAtPrice: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });

  return rows.map(toCardData);
}

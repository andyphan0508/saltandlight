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
  isFeatured?: boolean;
  images: { url: string }[];
  minPrice: Prisma.Decimal | null;
  maxCompareAtPrice: Prisma.Decimal | null;
}): ProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    isNew: p.isNew,
    isFeatured: p.isFeatured ?? false,
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
        isFeatured: true,
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

// ── High-Performance Cached Queries (Worker-isolate memory cache) ──
//
// unstable_cache() used to wrap these too, but its cross-request cache-hit
// coordination triggers a confirmed Cloudflare Workers runtime bug under
// concurrent requests ("Workers runtime canceled this request because it
// detected that your Worker's code had hung" — a promise from Next's cache
// handler resolved outside the request context that awaited it). It also
// bought nothing here: OpenNext-Cloudflare's incremental/tag cache is
// configured as "dummy" (no R2/KV backing), so unstable_cache's own
// persistence never actually worked — withMemoryCache (per-isolate, TTL'd)
// was already doing all the real caching. See docs/fe-spec... discussion
// and CPU-optimization notes from this session for the fuller cache story.
import { withMemoryCache } from "./memory-cache";

/** Cached categories with live counts for header, footer, and sidebar (cached 5 mins) */
export const getCachedCategoriesWithCounts = () =>
  withMemoryCache("nav-categories-with-counts", 300, () => listCategoriesWithCounts());

/** Cached available sizes across active variants (cached 10 mins) */
export const getCachedAvailableSizes = () =>
  withMemoryCache("available-product-sizes", 600, () => listAvailableSizes());

/** Cached featured products for home page: prioritizes products with isFeatured = true (cached 60s) */
export const getCachedFeaturedProducts = (pageSize = 10) => {
  return withMemoryCache(`homepage-featured-products-${pageSize}`, 60, async () => {
      // 1. Fetch explicitly marked featured products
      const featuredRows = await prisma.product.findMany({
        where: { status: "published", isFeatured: true },
        orderBy: { updatedAt: "desc" },
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          isNew: true,
          isFeatured: true,
          minPrice: true,
          maxCompareAtPrice: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      });

      // 2. If fewer than pageSize, backfill with newest published products
      let rows = featuredRows;
      if (featuredRows.length < pageSize) {
        const remaining = pageSize - featuredRows.length;
        const excludedIds = featuredRows.map((f) => f.id);
        const backfill = await prisma.product.findMany({
          where: {
            status: "published",
            id: { notIn: excludedIds },
          },
          orderBy: { createdAt: "desc" },
          take: remaining,
          select: {
            id: true,
            name: true,
            slug: true,
            isNew: true,
            isFeatured: true,
            minPrice: true,
            maxCompareAtPrice: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
          },
        });
        rows = [...featuredRows, ...backfill];
      }

      return {
        products: rows.map(toCardData),
        total: rows.length,
      };
    });
};

/** Cached product detail by slug (cached 120s) */
export const getCachedProductBySlug = (slug: string) =>
  withMemoryCache(`product-detail-${slug}`, 120, () => getProductBySlug(slug));

/** Cached related products by category (cached 120s) */
export const getCachedRelatedProducts = (categoryId: string, excludeId: string, limit = 4) =>
  withMemoryCache(`related-products-${categoryId}-${excludeId}-${limit}`, 120, () =>
    getRelatedProducts(categoryId, excludeId, limit)
  );

/** Cached published products with filters for catalog browsing & search (cached 60s) */
export const getCachedPublishedProducts = (filters: ProductListFilters = {}) => {
  const cacheKey = JSON.stringify({
    c: filters.categorySlugs?.slice().sort() ?? [],
    s: filters.sizes?.slice().sort() ?? [],
    o: filters.onSale ?? false,
    q: filters.query ?? "",
    sort: filters.sort ?? "latest",
    p: filters.page ?? 1,
    ps: filters.pageSize ?? 12,
  });

  return withMemoryCache(`catalog-products-${cacheKey}`, 60, () => listPublishedProducts(filters));
};

/** Cached shipping zones (with their methods) for cart quote & checkout, priced per region (cached 10 mins) */
export const getCachedShippingZones = () =>
  withMemoryCache("shipping-zones", 600, async () => {
    return prisma.shippingZone.findMany({
      select: {
        id: true,
        provinceCodes: true,
        methods: {
          select: {
            id: true,
            type: true,
            fee: true,
            freeThreshold: true,
            isActive: true,
          },
        },
      },
    });
  });

/** List active banners for homepage slider */
export async function listBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** Cached active banners for hero slider (cached 60s) */
export const getCachedBanners = () =>
  withMemoryCache("homepage-hero-banners", 60, () => listBanners());

/** List visible content blocks for a page, in display order */
export async function listPageBlocks(page: string) {
  return prisma.pageBlock.findMany({
    where: { page, isVisible: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** Cached page blocks (cached 60s) */
export const getCachedPageBlocks = (page: string) =>
  withMemoryCache(`page-blocks-${page}`, 60, () => listPageBlocks(page));

/** Admin-configured QR image / transfer note / thank-you-only toggle shown on the order confirmation page */
export async function getPaymentSettings() {
  return prisma.paymentSettings.findUnique({ where: { id: "default" } });
}

/** Cached payment settings (cached 300s — this rarely changes, and every order confirmation view reads it) */
export const getCachedPaymentSettings = () =>
  withMemoryCache("payment-settings", 300, () => getPaymentSettings());

/** List active discount campaigns for storefront announcements and product badges */
export async function listActivePromotions() {
  const now = new Date();
  return prisma.promotion.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

export const getCachedActivePromotions = () =>
  withMemoryCache("active-promotions", 60, () => listActivePromotions());

/** Admin-configured header/footer/logo/menu content. Row is optional — null fields fall back at the call site via `resolveSiteSettings`. */
export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "default" } });
}

/** Cached site settings (cached 300s — this rarely changes). */
export const getCachedSiteSettings = () =>
  withMemoryCache("site-settings", 300, () => getSiteSettings());



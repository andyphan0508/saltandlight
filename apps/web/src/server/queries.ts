import { prisma, Prisma } from "@saltandlight/db";
import type { ProductCardData } from "@/interfaces/catalog";
import { parseProductGuides } from "@/helpers/product-guides";


export interface ProductListFilters {
  categorySlugs?: string[];
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

const toCardData = (p: {
  id: string;
  name: string;
  slug: string;
  isNew: boolean;
  isFeatured?: boolean;
  images: { url: string }[];
  minPrice: Prisma.Decimal | null;
  maxCompareAtPrice: Prisma.Decimal | null;
}): ProductCardData => {
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
};

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
export const listPublishedProducts = async (
  filters: ProductListFilters = {},
): Promise<{ products: ProductCardData[]; total: number }> => {
  const { categorySlugs, onSale: isOnSale, query, sort = "latest", page = 1, pageSize = 12 } = filters;

  const where: Prisma.ProductWhereInput = {
    status: "published",
    ...(categorySlugs?.length ? { categories: { some: { slug: { in: categorySlugs } } } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(isOnSale ? { variants: { some: { isActive: true, compareAtPrice: { not: null } } } } : {}),
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
};

/** Category list with a live count of published products in each — for the sidebar filter. */
export const listCategoriesWithCounts = async () => {
  const [categories, totalPublished] = await Promise.all([
    // Counts every product listed under the category, not only those it is primary for
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { taggedProducts: { where: { status: "published" } } } } },
    }),
    prisma.product.count({ where: { status: "published" } }),
  ]);
  return {
    categories: categories.map(({ _count, ...c }) => ({ ...c, count: _count.taggedProducts })),
    totalPublished,
  };
};

export const getProductBySlug = async (slug: string) => {
  return prisma.product.findFirst({
    where: { slug, status: "published" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
};

export const getRelatedProducts = async (
  categoryId: string,
  excludeId: string,
  limit = 4,
): Promise<ProductCardData[]> => {
  const rows = await prisma.product.findMany({
    where: { status: "published", categories: { some: { id: categoryId } }, id: { not: excludeId } },
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
};

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
import type { SortOption } from "@/helpers/catalog-sort";

/** Cached categories with live counts for header, footer, and sidebar (cached 5 mins) */
export const getCachedCategoriesWithCounts = () =>
  withMemoryCache("nav-categories-with-counts", 300, () => listCategoriesWithCounts());

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
export const listBanners = async () => {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
};

/** Cached active banners for hero slider (cached 60s) */
export const getCachedBanners = () =>
  withMemoryCache("homepage-hero-banners", 60, () => listBanners());

/** List visible content blocks for a page, in display order */
export const listPageBlocks = async (page: string) => {
  return prisma.pageBlock.findMany({
    where: { page, isVisible: true },
    orderBy: { sortOrder: "asc" },
  });
};

/** Cached page blocks (cached 60s) */
export const getCachedPageBlocks = (page: string) =>
  withMemoryCache(`page-blocks-${page}`, 60, () => listPageBlocks(page));

/** Admin-configured QR image / transfer note / thank-you-only toggle shown on the order confirmation page */
export const getPaymentSettings = async () => {
  return prisma.paymentSettings.findUnique({ where: { id: "default" } });
};

/** Cached payment settings (cached 300s — this rarely changes, and every order confirmation view reads it) */
export const getCachedPaymentSettings = () =>
  withMemoryCache("payment-settings", 300, () => getPaymentSettings());

/** Admin-configured header/footer/logo/menu content. Row is optional — null fields fall back at the call site via `resolveSiteSettings`. */
export const getSiteSettings = async () => {
  return prisma.siteSettings.findUnique({ where: { id: "default" } });
};

/** Cached site settings (cached 300s — this rarely changes). */
export const getCachedSiteSettings = () =>
  withMemoryCache("site-settings", 300, () => getSiteSettings());

/** Category-level product guides (care, size charts, highlights), stored on the site_settings row. */
export const getProductGuides = async () => {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" }, select: { careGuides: true } });
  return parseProductGuides(row?.careGuides);
};

/** Cached product guides (60s; the admin save clears the entry on its own isolate immediately). */
export const getCachedProductGuides = () =>
  withMemoryCache("product-guides", 60, () => getProductGuides());



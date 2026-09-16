import Link from "next/link";
import Image from "next/image";
import { prisma } from "@saltandlight/db";
import { Button } from "@saltandlight/ui";
import { ArrowRight, Sparkles } from "@/components/Icons";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductSlider } from "./ProductSlider";
import { ProductListModal } from "./ProductListModal";
import { UpcomingCollectionBanner } from "@/components/UpcomingCollectionBanner";
import { getCachedFeaturedProducts } from "@/server/queries";
import { toPlain } from "@/helpers/serialize";
import { gridViewFor, layoutUsesImage, readLayout } from "@/helpers/product-block-layout";
import type { ProductCardData } from "@/interfaces/catalog";

export interface FeaturedProductsContent {
  eyebrow?: string;
  headline: string;
  ctaLabel?: string;
  ctaHref?: string;
  count?: number;
  sourceType?: "all" | "category" | "manual";
  categoryId?: string | null;
  categorySlug?: string;
  categoryName?: string;
  productIds?: string[];
  /** Layout preset — "grid" | "slider" | "banner-top" | "image-left". */
  displayMode?: string;
  /** Product columns on desktop for the grid presets. */
  columns?: "2" | "3" | "4";
  /** Shown by the banner-top / image-left presets. */
  imageUrl?: string;
  imageHref?: string;
  imageAlt?: string;
  allowViewAll?: boolean;
  viewAllMode?: "link" | "modal";
}

export const FeaturedProductsBlock = async ({
  content,
}: {
  content: FeaturedProductsContent;
}) => {
  const count = content.count ?? 8;
  const sourceType = content.sourceType || "all";
  const layout = readLayout(content.displayMode);
  const gridView = gridViewFor(layout, content.columns);
  const isViewAllAllowed = content.allowViewAll ?? true;
  const viewAllMode = content.viewAllMode || "link";

  let products: ProductCardData[] = [];
  let resolvedCategorySlug = content.categorySlug;

  try {
    if (sourceType === "category") {
      if (!resolvedCategorySlug && content.categoryId) {
        const cat = await prisma.category.findUnique({
          where: { id: content.categoryId },
          select: { slug: true },
        });
        if (cat) resolvedCategorySlug = cat.slug;
      }

      if (content.categoryId || resolvedCategorySlug) {
        const takeLimit = isViewAllAllowed && viewAllMode === "modal" ? 100 : count;
        const categoryWhere = content.categoryId
          ? { categoryId: content.categoryId }
          : { category: { slug: resolvedCategorySlug } };

        const rows = await prisma.product.findMany({
          where: {
            status: "published",
            ...categoryWhere,
          },
          orderBy: { createdAt: "desc" },
          take: takeLimit,
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

        products = rows.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          isNew: p.isNew,
          isFeatured: p.isFeatured ?? false,
          imageUrl: p.images[0]?.url ?? null,
          minPrice: p.minPrice ? Number(p.minPrice) : 0,
          maxCompareAtPrice: p.maxCompareAtPrice ? Number(p.maxCompareAtPrice) : null,
        }));
      }
    } else if (sourceType === "manual" && content.productIds && content.productIds.length > 0) {
      const rows = await prisma.product.findMany({
        where: {
          id: { in: content.productIds },
          status: "published",
        },
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

      const productMap = new Map(rows.map((r) => [r.id, r]));
      const orderedRows = content.productIds
        .map((id) => productMap.get(id))
        .filter(Boolean) as typeof rows;

      products = orderedRows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        isNew: p.isNew,
        isFeatured: p.isFeatured ?? false,
        imageUrl: p.images[0]?.url ?? null,
        minPrice: p.minPrice ? Number(p.minPrice) : 0,
        maxCompareAtPrice: p.maxCompareAtPrice ? Number(p.maxCompareAtPrice) : null,
      }));
    } else {
      const fallbackResult = await getCachedFeaturedProducts(count);
      products = toPlain(fallbackResult.products);
    }
  } catch (err) {
    console.error("FeaturedProductsBlock fetch error:", err);
  }

  const ctaTargetUrl =
    sourceType === "category" && resolvedCategorySlug
      ? `/san-pham?categories=${resolvedCategorySlug}`
      : content.ctaHref || "/san-pham";

  const displayedProducts = products.slice(0, count);

  return (
    <section className="mx-auto max-w-7xl px-4 animate-slide-up-fade">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/10 pb-4">
        <div>
          {content.eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-forest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {content.eyebrow}
            </span>
          )}
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold uppercase text-ink">
            {content.headline}
          </h2>
        </div>

        {/* View All Action */}
        {isViewAllAllowed && (
          <div>
            {viewAllMode === "modal" ? (
              <ProductListModal
                title={content.headline}
                ctaLabel={content.ctaLabel || "Xem tất cả"}
                ctaHref={ctaTargetUrl}
                products={products}
              />
            ) : (
              <Link
                href={ctaTargetUrl}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-ink/20 text-ink hover:border-ink hover:bg-mint-50 active:scale-[0.98] text-xs px-3.5 py-2 font-semibold transition-all duration-200"
              >
                <span>{content.ctaLabel || "Xem tất cả"}</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}
      </div>

      {displayedProducts.length === 0 ? (
        <UpcomingCollectionBanner
          categoryName={content.headline}
          ctaHref={ctaTargetUrl || "/san-pham"}
        />
      ) : layout === "slider" ? (
        <ProductSlider products={displayedProducts} />
      ) : layout === "image-left" ? (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 items-start">
          <BlockImage content={content} className="aspect-[4/5] lg:sticky lg:top-24" />
          <ProductGrid products={displayedProducts} view={gridView} />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {layout === "banner-top" && <BlockImage content={content} className="aspect-[21/9] sm:aspect-[24/7]" />}
          <ProductGrid products={displayedProducts} view={gridView} />
        </div>
      )}
    </section>
  );
};

/** The preset's image slot. Renders nothing until the admin uploads one, so an
 *  unfinished block degrades to a plain grid instead of a broken gap. */
const BlockImage = ({ content, className }: { content: FeaturedProductsContent; className: string }) => {
  if (!layoutUsesImage(readLayout(content.displayMode)) || !content.imageUrl) return null;

  const image = (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-mint-50 ${className}`}>
      <Image
        src={content.imageUrl}
        alt={content.imageAlt || content.headline}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );

  return content.imageHref ? (
    <Link href={content.imageHref} className="block transition-transform hover:scale-[1.01]">
      {image}
    </Link>
  ) : (
    image
  );
};

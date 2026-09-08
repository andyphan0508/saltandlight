import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { Button } from "@saltandlight/ui";
import { ArrowRight, Sparkles } from "@/components/Icons";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductSlider } from "./ProductSlider";
import { ProductListModal } from "./ProductListModal";
import { getCachedFeaturedProducts } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import type { ProductCardData } from "@/lib/types";

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
  displayMode?: "grid" | "slider";
  allowViewAll?: boolean;
  viewAllMode?: "link" | "modal";
}

export async function FeaturedProductsBlock({
  content,
}: {
  content: FeaturedProductsContent;
}) {
  const count = content.count ?? 8;
  const sourceType = content.sourceType || "all";
  const displayMode = content.displayMode || "grid";
  const allowViewAll = content.allowViewAll ?? true;
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
        const takeLimit = allowViewAll && viewAllMode === "modal" ? 100 : count;
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-forest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {content.eyebrow}
            </span>
          )}
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black uppercase text-ink">
            {content.headline}
          </h2>
        </div>

        {/* View All Action */}
        {allowViewAll && (
          <div>
            {viewAllMode === "modal" ? (
              <ProductListModal
                title={content.headline}
                subtitle={content.eyebrow}
                categorySlug={resolvedCategorySlug}
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
        <div className="rounded-3xl border border-mint-200/80 bg-mint-50/40 p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-forest shadow-xs border border-mint-200">
            <Sparkles size={20} />
          </div>
          <h4 className="mt-3 font-display text-base font-bold text-ink">
            Bộ sưu tập đang chuẩn bị ra mắt
          </h4>
          <p className="mt-1 text-xs text-ink/65 max-w-md mx-auto">
            Các sản phẩm thuộc danh mục {content.headline} sẽ sớm có mặt. Bạn có thể khám phá thêm các bộ sưu tập khác của Salt &amp; Light!
          </p>
          <div className="mt-4">
            <Link href="/san-pham">
              <Button variant="outline" size="sm" className="rounded-xl font-bold">
                Khám phá tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      ) : displayMode === "slider" ? (
        <ProductSlider products={displayedProducts} />
      ) : (
        <ProductGrid products={displayedProducts} />
      )}
    </section>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { getCachedProductBySlug, getCachedRelatedProducts } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductGrid } from "@/components/ProductGrid";
import { ChevronRight } from "@/components/Icons";
import { ProductContentRenderer } from "@/components/ProductContentRenderer";
import { ProductCareGuideSection } from "@/components/ProductCareGuideSection";
import { getCachedSiteSettings } from "@/lib/queries";
import { resolveSiteSettings } from "@/lib/site-settings-types";
import { resolveProductCareGuide } from "@/lib/care-guide-types";

export const revalidate = 120;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "published" },
      select: { slug: true },
      take: 12,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch (err) {
    console.error("generateStaticParams /san-pham/[slug] error:", err);
    return [];
  }
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  try {
    const product = await getCachedProductBySlug(params.slug);
    return {
      title: product?.name
        ? `${product.name} · Áo Thun Cơ Đốc Salt & Light`
        : "Sản phẩm",
      description:
        product?.description ??
        "Thời trang và quà tặng Lời Chúa chất lượng cao từ Salt & Light."
    };
  } catch (err) {
    console.error("generateMetadata /san-pham/[slug] error:", err);
    return {
      title: "Sản phẩm · Salt & Light",
      description: "Thời trang và quà tặng Lời Chúa chất lượng cao từ Salt & Light."
    };
  }
}

export default async function ProductDetailPage({
  params
}: {
  params: { slug: string };
}) {
  const product = await getCachedProductBySlug(params.slug);
  if (!product) notFound();

  const plain = toPlain(product);
  const variants = plain.variants.map((v: any) => ({
    id: v.id,
    color: v.color,
    size: v.size,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
    stockQuantity: v.stockQuantity
  }));

  const relatedProducts = plain.categoryId
    ? toPlain(await getCachedRelatedProducts(plain.categoryId, plain.id, 4))
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-4 sm:py-10 space-y-8 sm:space-y-12 w-full min-w-0 overflow-x-hidden animate-slide-up-fade">
      {/* Breadcrumbs - horizontally scrollable without breaking on mobile */}
      <nav className="flex items-center gap-2 text-xs font-semibold uppercase text-ink/60 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
        <Link href="/" className="hover:text-ink flex-shrink-0">
          Trang chủ
        </Link>
        <ChevronRight size={12} className="flex-shrink-0 text-ink/30" />
        <Link href="/san-pham" className="hover:text-ink flex-shrink-0">
          Sản phẩm
        </Link>
        {plain.category && (
          <>
            <ChevronRight size={12} className="flex-shrink-0 text-ink/30" />
            <Link
              href={`/danh-muc/${plain.category.slug}`}
              className="hover:text-ink flex-shrink-0"
            >
              {plain.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} className="flex-shrink-0 text-ink/30" />
        <span className="text-brand-forest font-bold truncate max-w-[180px] sm:max-w-none">
          {plain.name}
        </span>
      </nav>

      {/* Product Main Showcase */}
      <div className="grid gap-6 lg:gap-12 lg:grid-cols-12 items-start w-full min-w-0">
        {/* Gallery: 5 cols on desktop, compact and centered */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 w-full min-w-0">
          <ProductGallery images={plain.images} productName={plain.name} />
        </div>

        {/* Buy Box & Specs: 7 cols on desktop */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 w-full min-w-0">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-mint-100 px-3 py-1 text-[11px] font-bold uppercase text-brand-forest">
                {plain.category?.name ?? "Thời trang Cơ Đốc"}
              </span>
              {plain.isNew && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase text-emerald-800">
                  Mới ra mắt
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold uppercase text-ink leading-tight">
              {plain.name}
            </h1>
          </div>

          {/* Interactive Buy Box */}
          <ProductBuyBox
            productId={plain.id}
            productName={plain.name}
            variants={variants}
            description={plain.description}
          />

          {/* Description & Block Content */}
          {plain.description && (
            <div className="border-t border-ink/10 pt-6 w-full min-w-0">
              <ProductContentRenderer content={plain.description} />
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-ink/10 pt-16 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest">
                Gợi ý cho bạn
              </span>
              <h2 className="font-display text-2xl font-bold uppercase text-ink mt-1">
                Sản Phẩm Cùng Bộ Sưu Tập
              </h2>
            </div>
            <Link
              href="/san-pham"
              className="text-xs font-bold uppercase hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}

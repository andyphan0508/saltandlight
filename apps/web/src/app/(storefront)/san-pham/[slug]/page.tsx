import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { getCachedProductBySlug, getCachedRelatedProducts } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductGrid } from "@/components/ProductGrid";
import { ChevronRight, Sparkles, Check, CrossIcon } from "@/components/Icons";

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
  const product = await getCachedProductBySlug(params.slug);
  return {
    title: product?.name
      ? `${product.name} · Áo Thun Cơ Đốc Salt & Light`
      : "Sản phẩm",
    description:
      product?.description ??
      "Thời trang và quà tặng Lời Chúa chất lượng cao từ Salt & Light."
  };
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold uppercase text-ink/60">
        <Link href="/" className="hover:text-ink">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <Link href="/san-pham" className="hover:text-ink">
          Sản phẩm
        </Link>
        {plain.category && (
          <>
            <ChevronRight size={12} />
            <Link
              href={`/danh-muc/${plain.category.slug}`}
              className="hover:text-ink"
            >
              {plain.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-brand-forest font-bold line-clamp-1">
          {plain.name}
        </span>
      </nav>

      {/* Product Main Showcase */}
      <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-start">
        {/* Gallery: 5 cols on desktop, compact and centered */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <ProductGallery images={plain.images} productName={plain.name} />
        </div>

        {/* Buy Box & Specs: 7 cols on desktop */}
        <div className="lg:col-span-7 space-y-8">
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

            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-black uppercase text-ink leading-tight">
              {plain.name}
            </h1>
          </div>

          {/* Interactive Buy Box */}
          <ProductBuyBox
            productId={plain.id}
            productName={plain.name}
            variants={variants}
          />

          {/* Product Highlights list */}
          <div className="rounded-3xl bg-cream p-6 border border-ink/10 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-2">
              <Sparkles size={16} className="text-gold-500" />
              Điểm Nổi Bật Của Sản Phẩm
            </h4>
            <ul className="space-y-2 text-xs text-ink/75">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
                <span>
                  Chất liệu 100% Cotton 4 chiều, thấm hút mồ hôi tối đa, thoáng
                  mát.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
                <span>
                  Công nghệ in DTG cao cấp, không nứt gãy hoặc phai màu sau khi
                  giặt.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
                <span>
                  Form dáng Regular Fit chuẩn Unisex, dễ dàng phối đồ đi học, đi
                  làm, đi nhóm.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
                <span>
                  Đóng gói chỉn chu kèm bookmark Lời Chúa và thiệp cảm ơn.
                </span>
              </li>
            </ul>
          </div>

          {/* Description & Bible verse section */}
          {plain.description && (
            <div className="border-t border-ink/10 pt-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-ink">
                Mô tả chi tiết &amp; Thông điệp
              </h3>
              <div className="mt-3 rounded-2xl bg-white p-5 border border-ink/10 text-sm text-ink/80 whitespace-pre-line leading-relaxed">
                {plain.description}
              </div>
            </div>
          )}

          {/* Care & Washing guide */}
          <div className="border-t border-ink/10 pt-6 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink">
              Hướng dẫn bảo quản áo cotton
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-ink/70">
              <div className="rounded-2xl bg-white p-3.5 border border-ink/10">
                <p className="font-bold text-ink mb-1">🧼 Giặt áo</p>
                <p>
                  Nên lộn trái áo khi giặt, không ngâm lâu trong chất tẩy mạnh.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-3.5 border border-ink/10">
                <p className="font-bold text-ink mb-1">👔 Phơi &amp; Ủi</p>
                <p>Phơi trong bóng râm mát. Không ủi trực tiếp lên hình in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-ink/10 pt-16 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-forest">
                Gợi ý cho bạn
              </span>
              <h2 className="font-display text-2xl font-black uppercase text-ink mt-1">
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { listPublishedProducts, listCategories } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { ProductGrid } from "@/components/ProductGrid";
import { Sparkles, ChevronRight, SlidersHorizontal } from "@/components/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  return {
    title: category ? `${category.name} · Salt & Light` : "Danh mục sản phẩm",
    description: `Khám phá các sản phẩm ${category?.name} mang thông điệp Lời Chúa chất lượng cao tại Salt & Light.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { slug: params.slug } }),
    listCategories(),
  ]);

  if (!category) notFound();

  const products = toPlain(await listPublishedProducts({ categorySlug: params.slug }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold uppercase text-ink/60">
        <Link href="/" className="hover:text-ink">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <Link href="/san-pham" className="hover:text-ink">
          Sản phẩm
        </Link>
        <ChevronRight size={12} />
        <span className="text-brand-forest font-bold">{category.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-mint-100 via-mint-50 to-cream p-8 sm:p-12 border border-mint-200/50 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold uppercase text-brand-forest">
            <Sparkles size={13} className="text-gold-500" />
            <span>Danh mục tuyển chọn</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-ink">
            {category.name}
          </h1>
          <p className="text-sm text-ink/70">
            Các mẫu {category.name.toLowerCase()} được thiết kế chỉn chu, in Lời Chúa sắc nét, chất liệu
            cao cấp và đồng giá ship 19K toàn quốc.
          </p>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/san-pham"
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink/70 hover:border-ink hover:text-ink transition-all"
          >
            Tất cả
          </Link>
          {categories.map((c) => {
            const isActive = c.slug === params.slug;
            return (
              <Link
                key={c.id}
                href={`/danh-muc/${c.slug}`}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-ink text-white shadow-sm"
                    : "border border-ink/15 bg-white text-ink/70 hover:border-ink hover:text-ink hover:bg-mint-50"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-ink/60 font-medium">
          <SlidersHorizontal size={15} />
          <span>{products.length} sản phẩm</span>
        </div>
      </div>

      {/* Grid */}
      <ProductGrid products={products} />
    </div>
  );
}

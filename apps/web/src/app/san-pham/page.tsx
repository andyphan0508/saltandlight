import Link from "next/link";
import { listPublishedProducts, listCategories } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { ProductGrid } from "@/components/ProductGrid";
import { Sparkles, SlidersHorizontal } from "@/components/Icons";

export const metadata = {
  title: "Tất cả sản phẩm · Áo Thun & Quà Tặng Lời Chúa",
  description: "Khám phá bộ sưu tập áo thun Cơ Đốc, túi tote canvas và quà tặng đức tin cao cấp tại Salt & Light.",
};
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim();
  const [products, categories] = await Promise.all([
    listPublishedProducts({ query }),
    listCategories(),
  ]);

  const plainProducts = toPlain(products);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-mint-100 via-mint-50 to-cream p-8 sm:p-12 border border-mint-200/50 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold uppercase text-brand-forest">
            <Sparkles size={13} className="text-gold-500" />
            <span>Bộ sưu tập 2026</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-ink">
            {query ? `Kết quả tìm kiếm: "${query}"` : "Tất Cả Sản Phẩm"}
          </h1>
          <p className="text-sm text-ink/70">
            {query
              ? `Tìm thấy ${plainProducts.length} sản phẩm phù hợp với từ khóa của bạn.`
              : "Thời trang & quà tặng mang thông điệp Lời Chúa — 100% Cotton chất lượng cao, đồng giá ship 19K toàn quốc."}
          </p>
        </div>
      </div>

      {/* Filter & Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/san-pham"
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              !query
                ? "bg-ink text-white shadow-sm"
                : "border border-ink/15 bg-white text-ink/70 hover:border-ink hover:text-ink"
            }`}
          >
            Tất cả ({plainProducts.length})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/danh-muc/${c.slug}`}
              className="rounded-full border border-ink/15 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink/70 hover:border-ink hover:text-ink hover:bg-mint-50 transition-all"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-ink/60 font-medium">
          <SlidersHorizontal size={15} />
          <span>Hiển thị {plainProducts.length} sản phẩm</span>
        </div>
      </div>

      {/* Grid */}
      <ProductGrid products={plainProducts} />
    </div>
  );
}

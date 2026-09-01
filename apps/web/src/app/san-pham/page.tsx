import { listPublishedProducts, listCategories } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { ProductGrid } from "@/components/ProductGrid";
import Link from "next/link";

export const metadata = { title: "Tất cả sản phẩm" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    listPublishedProducts(),
    listCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-black uppercase">Sản phẩm</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/danh-muc/${c.slug}`}
            className="rounded-pill border border-ink/15 px-4 py-1.5 text-xs font-semibold uppercase hover:bg-ink hover:text-white"
          >
            {c.name}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <ProductGrid products={toPlain(products)} />
      </div>
    </div>
  );
}

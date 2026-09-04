import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { ProductCard } from "./ProductCard";
import { ProductListItem } from "./ProductListItem";
import { Sparkles } from "./Icons";
import type { ProductCardData } from "@/lib/types";

const GRID_COLS: Record<string, string> = {
  "2": "grid-cols-2",
  "3": "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4",
  "4": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5",
};

export function ProductGrid({
  products,
  view = "4",
}: {
  products: ProductCardData[];
  view?: "2" | "3" | "4" | "list";
}) {
  if (products.length === 0) {
    return (
      <div className="my-8 rounded-3xl border border-ink/5 bg-white p-12 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 text-brand-forest">
          <Sparkles size={24} />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold uppercase text-ink">
          Không tìm thấy sản phẩm nào
        </h3>
        <p className="mt-1 text-xs text-ink/60">
          Vui lòng thử lại với bộ lọc khác hoặc quay về xem tất cả sản phẩm.
        </p>
        <div className="mt-6">
          <Link href="/san-pham">
            <Button variant="outline" size="sm">
              Xem tất cả sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-4">
        {products.map((p) => (
          <ProductListItem key={p.id} product={p} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-2.5 sm:gap-4.5 ${GRID_COLS[view] ?? GRID_COLS["4"]}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

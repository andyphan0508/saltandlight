import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { ProductCard } from "./ProductCard";
import { Sparkles } from "./Icons";
import type { ProductCardData } from "@/lib/types";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-card border border-ink/5 my-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 text-brand-forest">
          <Sparkles size={24} />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold uppercase text-ink">
          Không tìm thấy sản phẩm nào
        </h3>
        <p className="mt-1 text-xs text-ink/60">
          Vui lòng thử lại với từ khóa khác hoặc quay về xem tất cả sản phẩm.
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

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

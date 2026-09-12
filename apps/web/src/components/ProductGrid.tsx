import { ProductCard } from "./ProductCard";
import { ProductListItem } from "./ProductListItem";
import { UpcomingCollectionBanner } from "./UpcomingCollectionBanner";
import type { ProductCardData } from "@/lib/types";

const GRID_COLS: Record<string, string> = {
  "2": "grid-cols-2",
  "3": "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4",
  "4": "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5",
};

interface ProductGridProps {
  products: ProductCardData[];
  view?: "2" | "3" | "4" | "list";
}

export const ProductGrid = ({
  products,
  view = "4",
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="my-6">
        <UpcomingCollectionBanner
          title="BỘ SƯU TẬP MỚI SẮP ĐƯỢC RA MẮT"
          description="Không tìm thấy sản phẩm nào trong danh mục này hoặc bộ sưu tập sắp được ra mắt. Bạn có thể khám phá thêm các bộ sưu tập khác của Salt & Light!"
          ctaLabel="KHÁM PHÁ SẢN PHẨM"
          ctaHref="/san-pham"
        />
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
};

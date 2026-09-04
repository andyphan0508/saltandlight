"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { useWishlistStore } from "@/lib/wishlist-store";
import { ProductGrid } from "@/components/ProductGrid";
import { Heart, Sparkles } from "@/components/Icons";
import type { ProductCardData } from "@/lib/types";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, [productIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-ink/10 pb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-brand-forest">
            Sưu tập cá nhân
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-ink mt-1">
            Sản Phẩm Yêu Thích ({productIds.length})
          </h1>
        </div>
        <Link href="/san-pham" className="text-xs font-bold uppercase hover:underline text-ink/70">
          Khám phá thêm →
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-ink/50">Đang tải danh sách yêu thích…</div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-card border border-ink/5 max-w-lg mx-auto space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-sale shadow-sm">
            <Heart size={28} />
          </div>
          <h3 className="font-display text-lg font-black uppercase text-ink">
            Chưa có sản phẩm yêu thích nào
          </h3>
          <p className="text-xs text-ink/60">
            Hãy nhấn vào biểu tượng trái tim ở góc mỗi sản phẩm để lưu lại những mẫu áo bạn yêu thích nhé!
          </p>
          <div className="pt-2">
            <Link href="/san-pham">
              <Button variant="primary" size="md">
                Khám phá sản phẩm ngay
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { ProductGrid } from "@/components/ProductGrid";
import type { ProductCardData } from "@/lib/types";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products));
  }, [productIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-2xl font-black uppercase">Sản phẩm yêu thích</h1>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}

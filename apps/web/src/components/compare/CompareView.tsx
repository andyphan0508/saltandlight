"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { formatVND } from "@saltandlight/domain";
import { useCompareStore, useStoreHydrated } from "@/stores";
import type { ProductCardData } from "@/lib/types";

interface CompareProduct extends ProductCardData {
  colors: string[];
  sizes: string[];
}

interface CompareRowProps {
  label: string;
  children: ReactNode;
}

const CompareRow = ({ label, children }: CompareRowProps) => {
  return (
    <tr className="border-b border-ink/10">
      <th className="p-3 text-left text-xs font-bold uppercase text-ink/50">{label}</th>
      {children}
    </tr>
  );
};

export const CompareView = () => {
  const productIds = useCompareStore((s) => s.productIds);
  const toggle = useCompareStore((s) => s.toggle);
  const isHydrated = useStoreHydrated(useCompareStore);
  const [products, setProducts] = useState<CompareProduct[]>([]);

  useEffect(() => {
    // Wait for the persisted compare list to load from localStorage first —
    // otherwise this fires with the pre-hydration empty default and flashes
    // the "nothing to compare" empty state even when the list isn't empty.
    if (!isHydrated) return;
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products));
  }, [isHydrated, productIds]);

  const onRemove = (productId: string) => {
    toggle(productId);
  };

  if (!isHydrated) {
    return null;
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold uppercase">So sánh sản phẩm</h1>
        <p className="mt-4 text-ink/60">
          Chưa có sản phẩm nào để so sánh. Bấm &ldquo;So sánh&rdquo; trên trang chi tiết sản phẩm để thêm.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-slide-up-fade">
      <h1 className="font-display text-2xl font-bold uppercase">So sánh sản phẩm</h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <tbody>
            <CompareRow label="">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  <div className="relative aspect-square w-32 overflow-hidden rounded-xl bg-mint-100">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />}
                  </div>
                  <button onClick={() => onRemove(p.id)} className="mt-2 text-xs text-ink/40 underline">
                    Xóa
                  </button>
                </td>
              ))}
            </CompareRow>
            <CompareRow label="Tên sản phẩm">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top font-medium">
                  {p.name}
                </td>
              ))}
            </CompareRow>
            <CompareRow label="Giá">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  {formatVND(p.minPrice)}
                </td>
              ))}
            </CompareRow>
            <CompareRow label="Màu sắc">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  {p.colors.join(", ") || "—"}
                </td>
              ))}
            </CompareRow>
            <CompareRow label="Kích thước">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  {p.sizes.join(", ") || "—"}
                </td>
              ))}
            </CompareRow>
          </tbody>
        </table>
      </div>
    </div>
  );
};

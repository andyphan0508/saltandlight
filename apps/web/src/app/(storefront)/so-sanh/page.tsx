"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatVND } from "@saltandlight/domain";
import { useCompareStore } from "@/lib/compare-store";
import type { ProductCardData } from "@/lib/types";

interface CompareProduct extends ProductCardData {
  colors: string[];
  sizes: string[];
}

export default function ComparePage() {
  const productIds = useCompareStore((s) => s.productIds);
  const toggle = useCompareStore((s) => s.toggle);
  const [products, setProducts] = useState<CompareProduct[]>([]);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products));
  }, [productIds]);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-black uppercase">So sánh sản phẩm</h1>
        <p className="mt-4 text-ink/60">
          Chưa có sản phẩm nào để so sánh. Bấm &ldquo;So sánh&rdquo; trên trang chi tiết sản phẩm để thêm.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-black uppercase">So sánh sản phẩm</h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <tbody>
            <Row label="">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  <div className="relative aspect-square w-32 overflow-hidden rounded-xl bg-mint-100">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />}
                  </div>
                  <button onClick={() => toggle(p.id)} className="mt-2 text-xs text-ink/40 underline">
                    Xóa
                  </button>
                </td>
              ))}
            </Row>
            <Row label="Tên sản phẩm">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top font-medium">
                  {p.name}
                </td>
              ))}
            </Row>
            <Row label="Giá">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  {formatVND(p.minPrice)}
                </td>
              ))}
            </Row>
            <Row label="Màu sắc">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  {p.colors.join(", ") || "—"}
                </td>
              ))}
            </Row>
            <Row label="Kích thước">
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  {p.sizes.join(", ") || "—"}
                </td>
              ))}
            </Row>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-ink/10">
      <th className="p-3 text-left text-xs font-bold uppercase text-ink/50">{label}</th>
      {children}
    </tr>
  );
}

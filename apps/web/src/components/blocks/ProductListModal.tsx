"use client";

import { useState } from "react";
import { X, ShoppingBag, ArrowRight } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import type { ProductCardData } from "@/lib/types";
import { Button } from "@saltandlight/ui";
import Link from "next/link";

export function ProductListModal({
  title,
  subtitle,
  categorySlug,
  ctaLabel,
  ctaHref,
  products,
}: {
  title: string;
  subtitle?: string;
  categorySlug?: string;
  ctaLabel?: string;
  ctaHref?: string;
  products: ProductCardData[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 active-press hover:bg-mint-50 rounded-xl"
      >
        <span>{ctaLabel || "Xem toàn bộ danh sách"}</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-100 text-brand-forest font-black text-[10px]">
          {products.length}
        </span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-3xl bg-cream shadow-2xl border border-ink/10 overflow-hidden my-6 animate-pop-in flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10 bg-white/90 backdrop-blur-md flex-shrink-0">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-black uppercase text-ink">
                  {title}
                </h3>
                <p className="text-xs text-ink/60 mt-0.5">
                  Hiển thị toàn bộ <strong className="text-brand-forest">{products.length}</strong>{" "}
                  sản phẩm trong bộ sưu tập này
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            {/* Products Grid Container */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {products.length === 0 ? (
                <div className="py-16 text-center text-ink/40">
                  <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-sm">Chưa có sản phẩm nào trong danh mục này</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-ink/10 bg-white/80 flex-shrink-0">
              <span className="text-xs text-ink/50 font-medium hidden sm:inline">
                Salt &amp; Light Faith Apparel
              </span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {ctaHref && (
                  <Link href={ctaHref} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl">
                      <span>Mở trang danh mục đầy đủ</span>
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl text-xs px-5"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

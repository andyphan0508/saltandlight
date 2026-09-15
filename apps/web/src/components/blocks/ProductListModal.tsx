"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { Modal } from "@/components/Modal";
import { X, ShoppingBag, ArrowRight } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import type { ProductCardData } from "@/lib/types";

interface ProductListModalProps {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  products: ProductCardData[];
}

/** "See all" button plus a dialog listing every product of a featured-products block. */
export const ProductListModal = ({ title, ctaLabel, ctaHref, products }: ProductListModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);

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
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-100 text-brand-forest font-bold text-[10px]">
          {products.length}
        </span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isDismissable
        labelledBy="product-list-title"
        className="max-w-5xl rounded-3xl bg-cream border border-ink/10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10 bg-white/90 backdrop-blur-md flex-shrink-0">
          <div>
            <h3 id="product-list-title" className="font-display text-lg sm:text-xl font-bold uppercase text-ink">
              {title}
            </h3>
            <p className="text-xs text-ink/60 mt-0.5">
              Hiển thị toàn bộ <strong className="text-brand-forest">{products.length}</strong> sản phẩm trong bộ sưu tập
              này
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

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

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-ink/10 bg-white/80 flex-shrink-0">
          <span className="text-xs text-ink/50 font-medium hidden sm:inline">Salt &amp; Light Faith Apparel</span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {ctaHref && (
              <Link
                href={ctaHref}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs rounded-xl border border-ink/20 px-3 py-1.5 font-semibold text-ink hover:bg-mint-50 active:scale-[0.98] transition-all"
              >
                <span>Mở trang danh mục đầy đủ</span>
                <ArrowRight size={13} />
              </Link>
            )}
            <Button type="button" variant="primary" size="sm" onClick={onClose} className="rounded-xl text-xs px-5">
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

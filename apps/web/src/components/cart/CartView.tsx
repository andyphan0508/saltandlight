"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCartStore, useStoreHydrated } from "@/stores";
import { fetchWithRetry } from "@/lib/fetch-with-retry";
import {
  CartSkeleton,
  CartEmptyState,
  FreeshipBanner,
  CartItemRow,
  CartSummaryCard,
} from "@/app/(storefront)/gio-hang/components";
import type { Quote } from "@/app/(storefront)/gio-hang/types";

export const CartView = () => {
  const cartLines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const hydrated = useStoreHydrated(useCartStore);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // Guards against an older, slower request overwriting a newer one's result.
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchQuote = useCallback(async (lines: { productVariantId: string; quantity: number }[]) => {
    if (!lines || lines.length === 0) {
      setQuote({ lines: [], subtotal: 0, shippingFee: 0, total: 0 });
      return;
    }
    const requestId = ++requestIdRef.current;
    try {
      const res = await fetchWithRetry("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines }),
        signal: AbortSignal.timeout(10000),
        retries: 2,
        retryDelayMs: 1000,
      });
      if (!res.ok) {
        console.warn("Quote request returned status:", res.status);
        return;
      }
      const data = await res.json().catch(() => null);
      if (requestId === requestIdRef.current && data && Array.isArray(data.lines)) {
        setQuote(data);
      }
    } catch (err) {
      console.warn("Quote request failed:", err);
    }
  }, []);

  // Re-fetches the full quote only when the SET of items in the cart changes
  const lineIdsKey = cartLines.map((l) => l.productVariantId).sort().join(",");
  useEffect(() => {
    if (!hydrated) return;
    if (cartLines.length === 0) {
      setQuote({ lines: [], subtotal: 0, shippingFee: 0, total: 0 });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchQuote(cartLines).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, lineIdsKey]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const onQuantityChange = (productVariantId: string, nextQuantity: number) => {
    setQuantity(productVariantId, nextQuantity);

    if (nextQuantity <= 0) {
      return;
    }

    setQuote((prev) => {
      if (!prev || !Array.isArray(prev.lines)) return prev;
      const lines = prev.lines.map((l) =>
        l.productVariantId === productVariantId
          ? { ...l, quantity: nextQuantity, lineTotal: l.unitPrice * nextQuantity }
          : l,
      );
      const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
      return { ...prev, lines, subtotal, total: subtotal + (prev.shippingFee ?? 0) };
    });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const latestLines = useCartStore.getState().lines;
      if (latestLines.length > 0) fetchQuote(latestLines);
    }, 600);
  };

  const subtotal = quote?.subtotal ?? 0;
  const lines = quote?.lines ?? [];
  const totalItemCount = lines.reduce((s, l) => s + (l.quantity ?? 1), 0);

  // If store is not hydrated, or is loading items for the first time without a quote yet
  if (!hydrated || (isLoading && !quote && cartLines.length > 0)) {
    return <CartSkeleton />;
  }

  // Cart is empty
  if (cartLines.length === 0 || (!isLoading && lines.length === 0)) {
    return <CartEmptyState />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8 animate-slide-up-fade">
      {/* Title */}
      <div className="border-b border-ink/10 pb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-ink">
          Giỏ Hàng Của Bạn ({totalItemCount} món)
        </h1>
      </div>

      {/* Free Shipping Progress Card */}
      <FreeshipBanner subtotal={subtotal} />

      {/* Main Cart Content */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Cart Item List */}
        <div className="space-y-4 lg:col-span-7">
          {lines.map((line) => (
            <CartItemRow
              key={line.productVariantId}
              line={line}
              onQuantityChange={onQuantityChange}
              onRemove={remove}
            />
          ))}

          <div className="pt-2">
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-forest hover:underline"
            >
              ← Tiếp tục mua sắm thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* Order Summary Box */}
        <CartSummaryCard
          quote={quote}
          subtotal={subtotal}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          isCouponApplied={isCouponApplied}
          setIsCouponApplied={setIsCouponApplied}
        />
      </div>
    </div>
  );
};

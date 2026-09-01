"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import { useCartStore } from "@/lib/cart-store";

interface QuoteLine {
  productVariantId: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  color: string | null;
  size: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
}

interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export default function CartPage() {
  const cartLines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cartLines.length === 0) {
      setQuote({ lines: [], subtotal: 0, shippingFee: 0, total: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartLines }),
    })
      .then((r) => r.json())
      .then(setQuote)
      .finally(() => setLoading(false));
  }, [cartLines]);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-ink/50">Đang tải giỏ hàng…</div>;
  }

  if (!quote || quote.lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-black uppercase">Giỏ hàng trống</h1>
        <Link href="/san-pham" className="mt-6 inline-block">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-black uppercase">Giỏ hàng</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {quote.lines.map((line) => (
            <div key={line.productVariantId} className="flex gap-4 border-b border-ink/10 pb-6">
              <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-mint-100">
                {line.image && <Image src={line.image} alt={line.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <Link href={`/san-pham/${line.slug}`} className="font-medium hover:underline">
                  {line.name}
                </Link>
                <div className="mt-1 text-xs text-ink/50">
                  {[line.color, line.size].filter(Boolean).join(" / ")}
                </div>
                <div className="mt-2 text-sm font-semibold">{formatVND(line.unitPrice)}</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-pill border border-ink/20">
                    <button
                      className="h-8 w-8"
                      onClick={() => setQuantity(line.productVariantId, line.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <button
                      className="h-8 w-8"
                      onClick={() =>
                        setQuantity(
                          line.productVariantId,
                          Math.min(line.quantity + 1, line.availableStock),
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(line.productVariantId)}
                    className="text-xs text-ink/40 underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold">{formatVND(line.lineTotal)}</div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl bg-mint-100 p-6">
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span>{formatVND(quote.subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span>Phí vận chuyển</span>
            <span>{quote.shippingFee === 0 ? "Miễn phí" : formatVND(quote.shippingFee)}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 font-semibold">
            <span>Tổng cộng</span>
            <span>{formatVND(quote.total)}</span>
          </div>
          <Link href="/thanh-toan" className="mt-6 block">
            <Button className="w-full">Thanh toán</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

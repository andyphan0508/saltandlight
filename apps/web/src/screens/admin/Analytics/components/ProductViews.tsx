"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductFunnel } from "@/helpers/analytics/sessions";
import { formatDuration, formatInt, formatPercent } from "../format";

const avgViewMs = (p: ProductFunnel) => (p.views > 0 ? p.viewDurationMs / p.views : 0);

const SORTS = [
  { id: "views", label: "Xem nhiều", by: (p: ProductFunnel) => p.views },
  { id: "time", label: "Xem lâu", by: avgViewMs },
  { id: "carts", label: "Thêm giỏ nhiều", by: (p: ProductFunnel) => p.cartSessions },
  { id: "wishlists", label: "Yêu thích nhiều", by: (p: ProductFunnel) => p.wishlists },
] as const;

type SortId = (typeof SORTS)[number]["id"];

const ProductLink = ({ p }: { p: ProductFunnel }) => (
  <Link href={`/admin/products/${p.productId}`} className="line-clamp-1 font-semibold text-slate-900 hover:text-brand-forest">
    {p.productName || p.productId}
  </Link>
);

/** A metric cell: a table column on desktop, a labelled figure on the phone card. */
const Metric = ({ label, value, sub, isSorted }: { label: string; value: string; sub?: string; isSorted: boolean }) => (
  <td className="py-2 pr-3 text-right max-md:p-0 max-md:text-left">
    <span className="block text-[10px] text-slate-500 md:hidden">{label}</span>
    <span className={isSorted ? "font-bold text-slate-900" : ""}>{value}</span>
    {sub && <span className="block text-[10px] text-slate-400">{sub}</span>}
  </td>
);

/**
 * Every published product ranked by the chosen interaction — opened, looked at longest,
 * put in the cart, saved to the wishlist — plus the ones nobody touched.
 */
export const ProductViews = ({ products }: { products: ProductFunnel[] }) => {
  const [sortId, setSortId] = useState<SortId>("views");
  if (products.length === 0) return <p className="text-xs text-slate-400">Chưa có sản phẩm nào.</p>;

  const sort = SORTS.find((s) => s.id === sortId)!;
  // A heart on a listing card counts as interest even without opening the product
  const touched = products
    .filter((p) => p.views > 0 || p.cartSessions > 0 || p.wishlists > 0)
    .sort((a, b) => sort.by(b) - sort.by(a) || b.views - a.views);
  const untouched = products
    .filter((p) => p.views === 0 && p.cartSessions === 0 && p.wishlists === 0)
    .sort((a, b) => a.productName.localeCompare(b.productName, "vi"));
  const totalViews = touched.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-600">
        <b className="text-slate-900">{formatInt(touched.length)}</b> sản phẩm có người quan tâm,{" "}
        <b className="text-slate-900">{formatInt(untouched.length)}</b> sản phẩm chưa ai xem
      </p>

      {touched.length > 0 && (
        <>
          <nav aria-label="Xếp hạng theo" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.id === sortId}
                onClick={() => setSortId(s.id)}
                className={`flex-shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors sm:py-1.5 ${
                  s.id === sortId ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-left text-xs tabular-nums max-md:block">
              <thead className="sticky top-0 border-b border-slate-100 bg-white text-[11px] text-slate-500 max-md:hidden">
                <tr>
                  <th className="py-2 pr-3 font-semibold">#</th>
                  <th className="py-2 pr-3 font-semibold">Sản phẩm</th>
                  <th className="py-2 pr-3 text-right font-semibold" title="Tổng số lần mở trang sản phẩm">Lượt xem</th>
                  <th className="py-2 pr-3 text-right font-semibold" title="Thời gian khách thật sự nhìn trang, trung bình mỗi lượt xem">
                    Xem trung bình
                  </th>
                  <th className="py-2 pr-3 text-right font-semibold" title="Số phiên truy cập có bỏ sản phẩm vào giỏ">Thêm giỏ</th>
                  <th className="py-2 text-right font-semibold" title="Số lần được bấm tim">Yêu thích</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 max-md:block">
                {touched.map((p, i) => (
                  <tr key={p.productId} className="max-md:grid max-md:grid-cols-4 max-md:gap-x-2 max-md:gap-y-1.5 max-md:py-3">
                    <td className="py-2 pr-3 text-slate-400 max-md:hidden">{i + 1}</td>
                    <td className="max-w-[280px] py-2 pr-3 max-md:col-span-4 max-md:max-w-none max-md:p-0">
                      <span className="mr-1.5 text-slate-400 md:hidden">{i + 1}.</span>
                      <span className="inline-block max-w-full align-bottom md:block">
                        <ProductLink p={p} />
                      </span>
                    </td>
                    <Metric
                      label="Lượt xem"
                      value={formatInt(p.views)}
                      sub={totalViews && p.views ? `${formatPercent(p.views / totalViews)} tổng` : undefined}
                      isSorted={sortId === "views"}
                    />
                    <Metric label="Xem TB" value={p.views ? formatDuration(avgViewMs(p)) : "—"} isSorted={sortId === "time"} />
                    <Metric label="Thêm giỏ" value={formatInt(p.cartSessions)} isSorted={sortId === "carts"} />
                    <Metric label="Yêu thích" value={formatInt(p.wishlists)} isSorted={sortId === "wishlists"} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {untouched.length > 0 && (
        <details className="rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-700">Chưa ai xem trong kỳ ({formatInt(untouched.length)})</summary>
          <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
            {untouched.map((p) => (
              <li key={p.productId}>
                <ProductLink p={p} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

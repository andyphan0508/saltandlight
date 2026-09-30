import Link from "next/link";
import type { ProductFunnel } from "@/helpers/analytics/sessions";
import { formatInt, formatPercent } from "../format";

const isAlarming = (p: ProductFunnel) => p.abandonRate >= 0.7 && p.cartSessions >= 3;

const ProductLink = ({ p }: { p: ProductFunnel }) => (
  <Link href={`/admin/products/${p.productId}`} className="line-clamp-1 font-semibold text-slate-900 hover:text-brand-forest">
    {p.productName || p.productId}
  </Link>
);

/**
 * Which products get put in the cart and left behind, most abandoned first. A table on
 * wide screens; on a phone each product is a card, since seven columns don't fit.
 */
export const AbandonedProducts = ({ products }: { products: ProductFunnel[] }) => {
  const rows = products.filter((p) => p.viewSessions > 0 || p.cartSessions > 0).slice(0, 20);
  if (rows.length === 0) return <p className="text-xs text-slate-400">Chưa có lượt xem hay thêm giỏ nào được ghi nhận.</p>;

  return (
    <>
      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((p) => (
          <li key={p.productId} className="py-3">
            <ProductLink p={p} />
            <dl className="mt-2 grid grid-cols-4 gap-2 text-xs tabular-nums">
              <div>
                <dt className="text-[10px] text-slate-500">Xem</dt>
                <dd className="text-slate-700">{formatInt(p.viewSessions)}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500">Thêm giỏ</dt>
                <dd className="text-slate-700">{formatInt(p.cartSessions)}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500">Bỏ giỏ</dt>
                <dd className="font-semibold text-slate-900">{formatInt(p.abandonedSessions)}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500">% bỏ giỏ</dt>
                <dd className={isAlarming(p) ? "font-semibold text-[#b42323]" : "text-slate-700"}>
                  {p.cartSessions > 0 ? formatPercent(p.abandonRate) : "—"}
                </dd>
              </div>
            </dl>
            <p className="mt-1.5 text-[11px] text-slate-400">
              xem → giỏ {formatPercent(p.viewToCartRate)} · SL thêm → mua {formatInt(p.addedQty)} → {formatInt(p.boughtQty)} · đã mua {formatInt(p.purchaseSessions)}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-xs tabular-nums">
          <thead className="border-b border-slate-100 text-[11px] text-slate-500">
            <tr>
              <th className="py-2 pr-3 font-semibold">Sản phẩm</th>
              <th className="py-2 pr-3 text-right font-semibold">Lượt xem</th>
              <th className="py-2 pr-3 text-right font-semibold">Thêm giỏ</th>
              <th className="py-2 pr-3 text-right font-semibold">Đã mua</th>
              <th className="py-2 pr-3 text-right font-semibold">Bỏ giỏ</th>
              <th className="py-2 pr-3 text-right font-semibold">% bỏ giỏ</th>
              <th className="py-2 text-right font-semibold" title="Số lượng sản phẩm được thêm vào giỏ → số lượng thật sự mua">SL thêm → mua</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.map((p) => (
              <tr key={p.productId}>
                <td className="max-w-[260px] py-2.5 pr-3">
                  <ProductLink p={p} />
                  <span className="text-[11px] text-slate-400">xem → giỏ {formatPercent(p.viewToCartRate)}</span>
                </td>
                <td className="py-2.5 pr-3 text-right">{formatInt(p.viewSessions)}</td>
                <td className="py-2.5 pr-3 text-right">{formatInt(p.cartSessions)}</td>
                <td className="py-2.5 pr-3 text-right">{formatInt(p.purchaseSessions)}</td>
                <td className="py-2.5 pr-3 text-right font-semibold text-slate-900">{formatInt(p.abandonedSessions)}</td>
                <td className={`py-2.5 pr-3 text-right ${isAlarming(p) ? "font-semibold text-[#b42323]" : ""}`}>
                  {p.cartSessions > 0 ? formatPercent(p.abandonRate) : "—"}
                </td>
                <td className="py-2.5 text-right">
                  {formatInt(p.addedQty)} → {formatInt(p.boughtQty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

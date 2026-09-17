import Link from "next/link";
import type { ProductFunnel } from "@/helpers/analytics/sessions";
import { formatInt, formatPercent } from "../format";

/** Which products get put in the cart and left behind, most abandoned first. */
export const AbandonedProducts = ({ products }: { products: ProductFunnel[] }) => {
  const rows = products.filter((p) => p.viewSessions > 0 || p.cartSessions > 0).slice(0, 20);
  if (rows.length === 0) return <p className="text-xs text-slate-400">Chưa có lượt xem hay thêm giỏ nào được ghi nhận.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs tabular-nums">
        <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
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
              <td className="max-w-[260px] py-2 pr-3">
                <Link href={`/admin/products/${p.productId}`} className="line-clamp-1 font-semibold text-slate-900 hover:text-brand-forest">
                  {p.productName || p.productId}
                </Link>
                <span className="text-[11px] text-slate-400">xem → giỏ {formatPercent(p.viewToCartRate)}</span>
              </td>
              <td className="py-2 pr-3 text-right">{formatInt(p.viewSessions)}</td>
              <td className="py-2 pr-3 text-right">{formatInt(p.cartSessions)}</td>
              <td className="py-2 pr-3 text-right">{formatInt(p.purchaseSessions)}</td>
              <td className="py-2 pr-3 text-right font-bold text-slate-900">{formatInt(p.abandonedSessions)}</td>
              <td className={`py-2 pr-3 text-right ${p.abandonRate >= 0.7 && p.cartSessions >= 3 ? "font-bold text-[#d03b3b]" : ""}`}>
                {p.cartSessions > 0 ? formatPercent(p.abandonRate) : "—"}
              </td>
              <td className="py-2 text-right">
                {formatInt(p.addedQty)} → {formatInt(p.boughtQty)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

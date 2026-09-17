import Link from "next/link";
import type { ProductFunnel } from "@/helpers/analytics/sessions";
import { formatInt, formatPercent } from "../format";

const ProductLink = ({ p }: { p: ProductFunnel }) => (
  <Link href={`/admin/products/${p.productId}`} className="line-clamp-1 font-semibold text-slate-900 hover:text-brand-forest">
    {p.productName || p.productId}
  </Link>
);

/** Every published product by how often it was opened, plus the ones nobody opened. */
export const ProductViews = ({ products }: { products: ProductFunnel[] }) => {
  const viewed = products.filter((p) => p.views > 0).sort((a, b) => b.views - a.views || b.viewSessions - a.viewSessions);
  const unviewed = products.filter((p) => p.views === 0).sort((a, b) => a.productName.localeCompare(b.productName, "vi"));
  const totalViews = viewed.reduce((sum, p) => sum + p.views, 0);
  if (products.length === 0) return <p className="text-xs text-slate-400">Chưa có sản phẩm nào.</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-600">
        <b className="text-slate-900">{formatInt(viewed.length)}</b> sản phẩm có người xem ·{" "}
        <b className="text-slate-900">{formatInt(unviewed.length)}</b> sản phẩm chưa ai xem
      </p>

      {viewed.length > 0 && (
        <div className="max-h-[480px] overflow-auto">
          <table className="w-full min-w-[560px] text-left text-xs tabular-nums">
            <thead className="sticky top-0 border-b border-slate-100 bg-white text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-semibold">#</th>
                <th className="py-2 pr-3 font-semibold">Sản phẩm</th>
                <th className="py-2 pr-3 text-right font-semibold" title="Tổng số lần mở trang sản phẩm">Lượt xem</th>
                <th className="py-2 pr-3 text-right font-semibold" title="Số phiên truy cập có mở sản phẩm này">Phiên xem</th>
                <th className="py-2 pr-3 text-right font-semibold">% tổng lượt xem</th>
                <th className="py-2 text-right font-semibold">Thêm giỏ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {viewed.map((p, i) => (
                <tr key={p.productId}>
                  <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                  <td className="max-w-[280px] py-2 pr-3">
                    <ProductLink p={p} />
                  </td>
                  <td className="py-2 pr-3 text-right font-bold text-slate-900">{formatInt(p.views)}</td>
                  <td className="py-2 pr-3 text-right">{formatInt(p.viewSessions)}</td>
                  <td className="py-2 pr-3 text-right">{formatPercent(p.views / totalViews)}</td>
                  <td className="py-2 text-right">{formatInt(p.cartSessions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {unviewed.length > 0 && (
        <details className="rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-700">Chưa ai xem trong kỳ ({formatInt(unviewed.length)})</summary>
          <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
            {unviewed.map((p) => (
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

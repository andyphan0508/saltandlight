import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Search } from "@/components/admin/Icons";
import { OrderListRow, type OrderListItem } from "@/components/admin/OrderListRow";
import { ADMIN_ORDER_STATUS as STATUS_META } from "@/helpers/order-status-styles";

export type OrderRow = OrderListItem;

export interface OrdersManagerProps {
  orders: OrderRow[];
  total: number;
  totalAll: number;
  countByStatus: Record<string, number>;
  page: number;
  pageSize: number;
  status?: string;
  query?: string;
}

export const OrdersManager = ({
  orders,
  total,
  totalAll,
  countByStatus,
  page,
  pageSize,
  status,
  query,
}: OrdersManagerProps) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle={`Tổng cộng ${totalAll} đơn hàng trên hệ thống`}
      />

      <div className="luno-card">
        {/* The header's search box is desktop-only; phones search here */}
        <form action="/admin/orders" className="relative border-b border-slate-100 p-4 md:hidden">
          {status && <input type="hidden" name="status" value={status} />}
          <Search size={16} className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Mã đơn, tên hoặc SĐT khách"
            enterKeyHint="search"
            className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-base text-ink placeholder:text-slate-400 focus:border-brand-forest focus:bg-white focus:outline-none"
          />
        </form>

        {/* Status filters: one swipeable row on phones, wrapping pills on desktop */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-slate-100 p-4 sm:flex-wrap sm:p-5">
          <StatusFilter href="/admin/orders" active={!status} label="Tất cả đơn" count={totalAll} />
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <StatusFilter
              key={key}
              href={`/admin/orders?status=${key}`}
              active={status === key}
              label={meta.label}
              count={countByStatus[key] ?? 0}
            />
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs max-md:block">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 max-md:hidden">
              <tr>
                <th className="px-5 py-3.5">Mã đơn hàng</th>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Tổng tiền</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Ngày đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 max-md:block">
              {orders.map((o) => (
                <OrderListRow key={o.id} order={o} />
              ))}
              {orders.length === 0 && (
                <tr className="max-md:block">
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400 max-md:block">
                    Không có đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            basePath="/admin/orders"
            searchParams={{ status, q: query }}
          />
        </div>
      </div>
    </div>
  );
};

const StatusFilter = ({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) => {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all sm:py-1.5 ${
        active
          ? "bg-ink text-white shadow-sm"
          : "border border-slate-200/80 bg-white text-slate-600 hover:border-brand-forest hover:text-brand-forest hover:bg-mint-50/30"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    </Link>
  );
};

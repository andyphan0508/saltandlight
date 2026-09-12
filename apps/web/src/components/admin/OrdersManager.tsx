import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";

export const STATUS_META: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 border-amber-200" },
  processing: { label: "Đang xử lý", className: "bg-sky-50 text-sky-700 border-sky-200" },
  on_hold: { label: "Tạm giữ", className: "bg-slate-100 text-slate-700 border-slate-200" },
  completed: { label: "Hoàn tất", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Đã hủy", className: "bg-slate-100 text-slate-500 border-slate-200" },
  refunded: { label: "Đã hoàn tiền", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export interface OrderRow {
  id: string;
  orderNumber: string;
  total: unknown;
  status: string;
  createdAt: Date;
  customer: {
    fullName: string;
    phone: string;
  };
}

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
        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4 sm:p-5">
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

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Mã đơn hàng</th>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Tổng tiền</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Ngày đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                const meta = STATUS_META[o.status] ?? {
                  label: o.status,
                  className: "bg-slate-100 text-slate-700 border-slate-200",
                };
                return (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-bold text-ink group-hover:text-brand-forest transition-colors"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800">{o.customer.fullName}</div>
                      <div className="text-[11px] text-slate-400">{o.customer.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-brand-forest text-sm">
                      {formatVND(Number(o.total))}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-400">
                      {o.createdAt.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
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

export const OrdersView = OrdersManager;

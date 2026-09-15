import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { ADMIN_ORDER_STATUS } from "@/helpers/order-status-styles";
import type { RecentOrder } from "@/server/admin/dashboard-lists";

const UNKNOWN_STATUS_CLASS = "bg-slate-100 text-slate-600 border-slate-200";

/** Latest orders: number, customer, total, status badge and date. */
export const RecentOrdersTable = ({ orders }: { orders: RecentOrder[] }) => (
  <div className="divide-y divide-slate-100 overflow-x-auto">
    <table className="w-full text-left text-xs">
      <thead>
        <tr className="text-slate-400 uppercase font-bold text-[10px]">
          <th className="py-2.5 px-2">Mã đơn</th>
          <th className="py-2.5 px-2">Khách hàng</th>
          <th className="py-2.5 px-2">Tổng tiền</th>
          <th className="py-2.5 px-2">Trạng thái</th>
          <th className="py-2.5 px-2 text-right">Ngày tạo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {orders.map((order) => {
          const badge = ADMIN_ORDER_STATUS[order.status] ?? { label: order.status, className: UNKNOWN_STATUS_CLASS };
          return (
            <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer">
              <td className="py-3 px-2">
                <Link href={`/admin/orders/${order.id}`} className="font-bold text-ink group-hover:text-brand-forest">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="py-3 px-2">
                <div className="font-bold text-slate-700">{order.customer.fullName}</div>
                <div className="text-[11px] text-slate-400">{order.customer.phone}</div>
              </td>
              <td className="py-3 px-2 font-bold text-brand-forest">{formatVND(Number(order.total))}</td>
              <td className="py-3 px-2">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.className}`}>
                  {badge.label}
                </span>
              </td>
              <td className="py-3 px-2 text-right font-medium text-slate-400">{order.createdAt.toLocaleDateString("vi-VN")}</td>
            </tr>
          );
        })}
        {orders.length === 0 && (
          <tr>
            <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
              Chưa có đơn hàng nào được ghi nhận.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

import { OrderListRow } from "@/components/admin/OrderListRow";
import type { RecentOrder } from "@/server/admin/dashboard-lists";

/** Latest orders: number, customer, total, status badge and date. Cards on phones. */
export const RecentOrdersTable = ({ orders }: { orders: RecentOrder[] }) => (
  <div className="overflow-x-auto max-md:-mx-4">
    <table className="w-full text-left text-xs max-md:block">
      <thead className="max-md:hidden">
        <tr className="text-slate-400 uppercase font-bold text-[10px]">
          <th className="py-2.5 px-2">Mã đơn</th>
          <th className="py-2.5 px-2">Khách hàng</th>
          <th className="py-2.5 px-2">Tổng tiền</th>
          <th className="py-2.5 px-2">Trạng thái</th>
          <th className="py-2.5 px-2 text-right">Ngày tạo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 max-md:block max-md:divide-slate-100">
        {orders.map((order) => (
          <OrderListRow key={order.id} order={order} isDense />
        ))}
        {orders.length === 0 && (
          <tr className="max-md:block">
            <td colSpan={5} className="py-8 text-center text-xs text-slate-400 max-md:block">
              Chưa có đơn hàng nào được ghi nhận.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

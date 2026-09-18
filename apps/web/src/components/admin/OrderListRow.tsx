import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { ADMIN_ORDER_STATUS } from "@/helpers/order-status-styles";

export interface OrderListItem {
  id: string;
  orderNumber: string;
  total: unknown;
  status: string;
  createdAt: Date;
  customer: { fullName: string; phone: string | null };
}

const UNKNOWN_STATUS_CLASS = "bg-slate-100 text-slate-700 border-slate-200";

/**
 * One order as a table row on desktop and as a tappable card below `md`: number and
 * status on top, customer across, total and date underneath. The whole card opens
 * the order (the number's link stretches over it), so a thumb never has to aim.
 * Pair with a table/tbody set to `max-md:block` and a thead set to `max-md:hidden`.
 */
export const OrderListRow = ({ order, isDense = false }: { order: OrderListItem; isDense?: boolean }) => {
  const cell = isDense ? "px-2 py-3" : "px-5 py-3.5";
  const meta = ADMIN_ORDER_STATUS[order.status] ?? { label: order.status, className: UNKNOWN_STATUS_CLASS };

  return (
    <tr className="group relative transition-colors hover:bg-slate-50/70 max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-1 max-md:px-4 max-md:py-3.5 max-md:active:bg-slate-50">
      <td className={`${cell} max-md:order-1 max-md:p-0`}>
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-bold text-ink transition-colors group-hover:text-brand-forest max-md:after:absolute max-md:after:inset-0"
        >
          {order.orderNumber}
        </Link>
      </td>
      <td className={`${cell} max-md:order-3 max-md:basis-full max-md:p-0`}>
        <div className="font-bold text-slate-800 max-md:inline max-md:font-semibold">{order.customer.fullName}</div>
        {order.customer.phone && (
          <div className="text-[11px] text-slate-400 max-md:ml-2 max-md:inline">{order.customer.phone}</div>
        )}
      </td>
      <td className={`${cell} text-sm font-bold text-brand-forest max-md:order-4 max-md:p-0`}>
        {formatVND(Number(order.total))}
      </td>
      <td className={`${cell} max-md:order-2 max-md:ml-auto max-md:p-0`}>
        <span
          className={`inline-block rounded-full border font-bold ${isDense ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-0.5 text-[11px]"} ${meta.className}`}
        >
          {meta.label}
        </span>
      </td>
      <td className={`${cell} text-right font-medium text-slate-400 max-md:order-5 max-md:ml-auto max-md:p-0 max-md:text-[11px]`}>
        {order.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
      </td>
    </tr>
  );
};

import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 15;

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Chờ thanh toán", className: "bg-gold-100 text-gold-600" },
  processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700" },
  on_hold: { label: "Tạm giữ", className: "bg-ink/8 text-ink/60" },
  completed: { label: "Hoàn tất", className: "bg-mint-100 text-brand-forest" },
  cancelled: { label: "Đã hủy", className: "bg-ink/8 text-ink/40" },
  refunded: { label: "Đã hoàn tiền", className: "bg-sale-light text-sale" },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const status = searchParams.status;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = status ? { status: status as never } : {};

  const [orders, total, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { customer: true },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countByStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all]));
  const totalAll = statusCounts.reduce((sum, s) => sum + s._count._all, 0);

  return (
    <div>
      <PageHeader title="Đơn hàng" subtitle={`${totalAll} đơn hàng tất cả trạng thái`} />

      <div className="rounded-2xl border border-ink/10 bg-white shadow-card">
        <div className="flex flex-wrap gap-1.5 border-b border-ink/10 p-4">
          <StatusFilter href="/orders" active={!status} label="Tất cả" count={totalAll} />
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <StatusFilter
              key={key}
              href={`/orders?status=${key}`}
              active={status === key}
              label={meta.label}
              count={countByStatus[key] ?? 0}
            />
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-semibold">Mã đơn</th>
                <th className="px-5 py-3 font-semibold">Khách hàng</th>
                <th className="px-5 py-3 font-semibold">Tổng tiền</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {orders.map((o) => {
                const meta = STATUS_META[o.status] ?? { label: o.status, className: "bg-ink/8" };
                return (
                  <tr key={o.id} className="hover:bg-mint-50/40">
                    <td className="px-5 py-3">
                      <Link href={`/orders/${o.id}`} className="font-semibold text-ink hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-ink/80">{o.customer.fullName}</div>
                      <div className="text-xs text-ink/40">{o.customer.phone}</div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-ink">{formatVND(Number(o.total))}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink/50">{o.createdAt.toLocaleDateString("vi-VN")}</td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-ink/40">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/orders" searchParams={{ status }} />
      </div>
    </div>
  );
}

function StatusFilter({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-ink text-white" : "border border-ink/15 text-ink/60 hover:border-ink/40"
      }`}
    >
      {label}
      <span className={active ? "text-white/70" : "text-ink/35"}>{count}</span>
    </Link>
  );
}

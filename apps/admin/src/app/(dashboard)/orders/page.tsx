import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  processing: "Đang xử lý",
  on_hold: "Tạm giữ",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Đơn hàng</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusFilter label="Tất cả" active={!status} href="/orders" />
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <StatusFilter key={key} label={label} active={status === key} href={`/orders?status=${key}`} />
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Tổng tiền</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-ink/5 last:border-0 hover:bg-mint-50">
                <td className="px-4 py-3">
                  <Link href={`/orders/${o.id}`} className="font-semibold hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.customer.fullName}</td>
                <td className="px-4 py-3">{formatVND(Number(o.total))}</td>
                <td className="px-4 py-3">
                  <span className="rounded-pill bg-mint-100 px-2.5 py-1 text-xs font-semibold">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/60">{o.createdAt.toLocaleDateString("vi-VN")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusFilter({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-pill px-4 py-1.5 text-xs font-semibold uppercase ${
        active ? "bg-ink text-white" : "border border-ink/15 text-ink/70"
      }`}
    >
      {label}
    </Link>
  );
}

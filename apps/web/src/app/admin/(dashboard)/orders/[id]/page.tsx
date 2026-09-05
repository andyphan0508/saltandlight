import { notFound } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { BackLink } from "@/components/admin/BackLink";
import { Package, History, Users, Truck } from "@/components/admin/Icons";

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Chờ thanh toán", className: "bg-gold-100 text-gold-600" },
  processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700" },
  on_hold: { label: "Tạm giữ", className: "bg-ink/8 text-ink/60" },
  completed: { label: "Hoàn tất", className: "bg-mint-100 text-brand-forest" },
  cancelled: { label: "Đã hủy", className: "bg-ink/8 text-ink/40" },
  refunded: { label: "Đã hoàn tiền", className: "bg-sale-light text-sale" },
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      shippingAddress: true,
      items: true,
      payments: true,
      statusHistory: { orderBy: { changedAt: "asc" }, include: { changedBy: true } },
    },
  });
  if (!order) notFound();

  const meta = STATUS_META[order.status] ?? { label: order.status, className: "bg-ink/8" };

  return (
    <div className="space-y-6">
      <BackLink href="/admin/orders" label="Quay lại danh sách đơn hàng" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black uppercase text-ink">{order.orderNumber}</h1>
          <p className="mt-1 text-xs text-ink/45">
            Đặt lúc {order.createdAt.toLocaleString("vi-VN")}
          </p>
        </div>
        <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase ${meta.className}`}>
          {meta.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Sản phẩm" icon={<Package size={15} />}>
            <div className="divide-y divide-ink/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2.5 text-sm first:pt-0 last:pb-0">
                  <span className="text-ink/80">
                    {item.productNameSnapshot}{" "}
                    <span className="text-ink/40">
                      ({[item.color, item.size].filter(Boolean).join(" / ") || "—"}) × {item.quantity}
                    </span>
                  </span>
                  <span className="font-medium text-ink">
                    {formatVND(Number(item.unitPrice) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between text-ink/55">
                <span>Tạm tính</span>
                <span>{formatVND(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-ink/55">
                <span>Vận chuyển</span>
                <span>{formatVND(Number(order.shippingFee))}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink">
                <span>Tổng cộng</span>
                <span>{formatVND(Number(order.total))}</span>
              </div>
            </div>
          </Section>

          <Section title="Lịch sử trạng thái" icon={<History size={15} />}>
            <ol className="space-y-3">
              {order.statusHistory.map((h, i) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-forest" />
                    {i < order.statusHistory.length - 1 && <span className="w-px flex-1 bg-ink/10" />}
                  </div>
                  <div className="pb-3">
                    <div className="font-semibold text-ink">
                      {STATUS_META[h.toStatus]?.label ?? h.toStatus}
                    </div>
                    <div className="text-xs text-ink/45">
                      {h.changedAt.toLocaleString("vi-VN")}
                      {h.changedBy ? ` · ${h.changedBy.fullName ?? h.changedBy.email}` : ""}
                    </div>
                    {h.note && <div className="mt-0.5 text-xs italic text-ink/50">{h.note}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Khách hàng" icon={<Users size={15} />}>
            <p className="text-sm font-semibold text-ink">{order.customer.fullName}</p>
            <p className="mt-0.5 text-sm text-ink/60">{order.customer.phone}</p>
            {order.customer.email && <p className="text-sm text-ink/60">{order.customer.email}</p>}
          </Section>

          <Section title="Địa chỉ giao hàng" icon={<Truck size={15} />}>
            <p className="text-sm text-ink/70">
              {order.shippingAddress.recipientName} — {order.shippingAddress.phone}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.ward},{" "}
              {order.shippingAddress.district}, {order.shippingAddress.province}
            </p>
            {order.note && (
              <p className="mt-3 rounded-lg bg-mint-50 p-2.5 text-xs italic text-ink/60">
                Ghi chú: {order.note}
              </p>
            )}
          </Section>

          <Section title="Cập nhật trạng thái">
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
      <div className="flex items-center gap-2">
        {icon && <span className="text-brand-forest">{icon}</span>}
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink/70">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { OrderStatusForm } from "@/components/OrderStatusForm";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  processing: "Đang xử lý",
  on_hold: "Tạm giữ",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black uppercase">{order.orderNumber}</h1>
        <span className="rounded-pill bg-mint-100 px-3 py-1.5 text-xs font-semibold uppercase">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Sản phẩm">
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.productNameSnapshot} ({[item.color, item.size].filter(Boolean).join(" / ")}) ×{" "}
                    {item.quantity}
                  </span>
                  <span>{formatVND(Number(item.unitPrice) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between text-ink/60">
                <span>Tạm tính</span>
                <span>{formatVND(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-ink/60">
                <span>Vận chuyển</span>
                <span>{formatVND(Number(order.shippingFee))}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span>{formatVND(Number(order.total))}</span>
              </div>
            </div>
          </Section>

          <Section title="Lịch sử trạng thái">
            <ul className="space-y-2 text-sm">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="text-ink/70">
                  {h.changedAt.toLocaleString("vi-VN")} —{" "}
                  <strong>{STATUS_LABEL[h.toStatus] ?? h.toStatus}</strong>
                  {h.changedBy ? ` bởi ${h.changedBy.fullName ?? h.changedBy.email}` : ""}
                  {h.note ? ` — ${h.note}` : ""}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Khách hàng">
            <p className="text-sm font-medium">{order.customer.fullName}</p>
            <p className="text-sm text-ink/60">{order.customer.phone}</p>
            {order.customer.email && <p className="text-sm text-ink/60">{order.customer.email}</p>}
          </Section>

          <Section title="Địa chỉ giao hàng">
            <p className="text-sm text-ink/70">
              {order.shippingAddress.recipientName} — {order.shippingAddress.phone}
            </p>
            <p className="text-sm text-ink/70">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.ward},{" "}
              {order.shippingAddress.district}, {order.shippingAddress.province}
            </p>
            {order.note && <p className="mt-2 text-sm italic text-ink/60">Ghi chú: {order.note}</p>}
          </Section>

          <Section title="Cập nhật trạng thái">
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6">
      <h2 className="text-sm font-bold uppercase text-ink/60">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

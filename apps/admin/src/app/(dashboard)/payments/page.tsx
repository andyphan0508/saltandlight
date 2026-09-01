import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { PaymentActions } from "@/components/PaymentActions";

export default async function PaymentsPage() {
  const payments = await prisma.paymentTransaction.findMany({
    where: { status: "awaiting_confirmation" },
    orderBy: { createdAt: "asc" },
    include: { order: { include: { customer: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Chuyển khoản chờ xác nhận</h1>
      <p className="mt-1 text-sm text-ink/60">
        Đối chiếu nội dung chuyển khoản (mã đơn hàng) với sao kê ngân hàng trước khi xác nhận.
      </p>

      <div className="mt-6 space-y-3">
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-5"
          >
            <div>
              <Link href={`/orders/${p.order.id}`} className="font-semibold hover:underline">
                {p.order.orderNumber}
              </Link>
              <div className="text-sm text-ink/60">
                {p.order.customer.fullName} · {p.order.customer.phone}
              </div>
              <div className="mt-1 text-sm">
                Số tiền: <strong>{formatVND(Number(p.amount))}</strong>
              </div>
            </div>
            <PaymentActions paymentId={p.id} />
          </div>
        ))}
        {payments.length === 0 && (
          <p className="rounded-2xl border border-ink/10 bg-white p-8 text-center text-ink/50">
            Không có giao dịch nào đang chờ xác nhận.
          </p>
        )}
      </div>
    </div>
  );
}

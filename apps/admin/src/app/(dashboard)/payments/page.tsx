import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { PageHeader } from "@/components/PageHeader";
import { PaymentActions } from "@/components/PaymentActions";
import { Wallet } from "@/components/Icons";

export default async function PaymentsPage() {
  const payments = await prisma.paymentTransaction.findMany({
    where: { status: "awaiting_confirmation" },
    orderBy: { createdAt: "asc" },
    include: { order: { include: { customer: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Thanh toán"
        subtitle="Đối chiếu nội dung chuyển khoản (mã đơn hàng) với sao kê ngân hàng trước khi xác nhận."
      />

      <div className="space-y-3">
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                <Wallet size={18} />
              </span>
              <div>
                <Link href={`/orders/${p.order.id}`} className="font-semibold text-ink hover:underline">
                  {p.order.orderNumber}
                </Link>
                <div className="text-xs text-ink/50">
                  {p.order.customer.fullName} · {p.order.customer.phone}
                </div>
                <div className="mt-1 text-sm font-bold text-ink">{formatVND(Number(p.amount))}</div>
              </div>
            </div>
            <PaymentActions paymentId={p.id} />
          </div>
        ))}
        {payments.length === 0 && (
          <div className="rounded-2xl border border-ink/10 bg-white p-12 text-center shadow-card">
            <Wallet size={28} className="mx-auto text-ink/20" />
            <p className="mt-3 text-sm text-ink/50">Không có giao dịch nào đang chờ xác nhận.</p>
          </div>
        )}
      </div>
    </div>
  );
}

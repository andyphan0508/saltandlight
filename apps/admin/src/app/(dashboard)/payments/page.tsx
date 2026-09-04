import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { PageHeader } from "@/components/PageHeader";
import { PaymentActions } from "@/components/PaymentActions";
import { Wallet, CheckCircle } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await prisma.paymentTransaction.findMany({
    where: { status: "awaiting_confirmation" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      amount: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          customer: {
            select: {
              fullName: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Duyệt giao dịch chuyển khoản"
        subtitle="Đối chiếu nội dung chuyển khoản với sao kê ngân hàng VietQR trước khi xác nhận đơn hàng."
      />

      <div className="space-y-3.5">
        {payments.map((p) => (
          <div
            key={p.id}
            className="luno-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:border-amber-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
                <Wallet size={22} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/orders/${p.order.id}`}
                    className="font-black text-slate-900 hover:text-brand-forest hover:underline transition-colors"
                  >
                    Đơn hàng #{p.order.orderNumber}
                  </Link>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    Chờ xác nhận
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Khách hàng: <strong>{p.order.customer.fullName}</strong> • SĐT: {p.order.customer.phone}
                </div>
                <div className="mt-1.5 text-base font-black text-brand-forest">
                  {formatVND(Number(p.amount))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PaymentActions paymentId={p.id} />
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div className="luno-card p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle size={28} />
            </div>
            <h3 className="mt-4 font-bold text-slate-800 text-sm">Tất cả giao dịch đã được xử lý!</h3>
            <p className="mt-1 text-xs text-slate-400">
              Hiện tại không có giao dịch chuyển khoản VietQR nào đang chờ đối chiếu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

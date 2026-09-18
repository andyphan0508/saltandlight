import Link from "next/link";
import type { PaymentMethod, PaymentStatus } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { CheckCircle } from "@/components/admin/Icons";
import { formatDayMonth } from "@/helpers/day-month";
import { PaymentActions } from "./PaymentActions";

export const PAYMENT_TABS: { status: PaymentStatus; label: string; short: string; empty: string }[] = [
  { status: "awaiting_confirmation", label: "Chưa thanh toán", short: "Chưa trả", empty: "Không còn khoản nào chờ thu hay chờ đối chiếu." },
  { status: "confirmed", label: "Đã thanh toán", short: "Đã trả", empty: "Chưa có khoản nào được xác nhận." },
  { status: "rejected", label: "Từ chối", short: "Từ chối", empty: "Không có giao dịch nào bị từ chối." },
];

const METHOD_LABEL = { bank_transfer: "Chuyển khoản", cod: "COD" } as const;

const formatDateTime = (date: Date) =>
  `${formatDayMonth(date)} lúc ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;

export interface PaymentRow {
  id: string;
  amount: unknown;
  method: PaymentMethod;
  createdAt: Date;
  confirmedAt: Date | null;
  order: { id: string; orderNumber: string; customer: { fullName: string; phone: string | null } };
}

export interface PaymentsManagerProps {
  tab: (typeof PAYMENT_TABS)[number];
  payments: PaymentRow[];
  countByStatus: Partial<Record<PaymentStatus, number>>;
  sum: number;
  page: number;
  pageSize: number;
}

/** Every payment, split by whether the money has come in. Unpaid first: that list is the work. */
export const PaymentsManager = ({ tab, payments, countByStatus, sum, page, pageSize }: PaymentsManagerProps) => {
  const isUnpaid = tab.status === "awaiting_confirmation";
  const countOf = (status: PaymentStatus) => countByStatus[status] ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thanh toán"
        subtitle="Khoản nào khách đã trả, khoản nào còn chờ"
      />

      <nav aria-label="Trạng thái thanh toán" className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 p-1 sm:inline-grid">
        {PAYMENT_TABS.map((t) => {
          const isActive = t.status === tab.status;
          return (
            <Link
              key={t.status}
              href={`/admin/payments?status=${t.status}`}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center rounded-xl px-3 py-2 text-center text-xs font-semibold transition-colors sm:flex-row sm:gap-2 sm:px-4 ${
                isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              <span className="sm:hidden">{t.short}</span>
              <span className="max-sm:hidden">{t.label}</span>
              <span className={`text-sm font-bold tabular-nums sm:text-xs ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                {countOf(t.status)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-baseline justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
        <span className="text-xs font-semibold text-slate-500">
          {isUnpaid ? "Tổng tiền chưa thu" : tab.status === "confirmed" ? "Tổng tiền đã nhận" : "Tổng tiền bị từ chối"}
        </span>
        <span className="text-lg font-bold text-slate-900">{formatVND(sum)}</span>
      </div>

      <ul className="space-y-3">
        {payments.map((p) => (
          <li key={p.id} className="luno-card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/admin/orders/${p.order.id}`}
                    className="font-bold text-slate-900 hover:text-brand-forest hover:underline"
                  >
                    {p.order.orderNumber}
                  </Link>
                  <span className="text-base font-bold tabular-nums text-brand-forest sm:hidden">
                    {formatVND(Number(p.amount))}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{p.order.customer.fullName}</span>
                  <span className="ml-2 text-slate-400">{p.order.customer.phone}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    className={`rounded-full px-2 py-0.5 font-bold ${
                      p.method === "cod" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"
                    }`}
                  >
                    {METHOD_LABEL[p.method]}
                  </span>
                  <span className="text-slate-400">
                    {p.confirmedAt ? `Xử lý ${formatDateTime(p.confirmedAt)}` : `Đặt ${formatDateTime(p.createdAt)}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <span className="hidden text-base font-bold tabular-nums text-brand-forest sm:block">
                  {formatVND(Number(p.amount))}
                </span>
                {isUnpaid &&
                  (p.method === "bank_transfer" ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500 sm:text-right">Đối chiếu sao kê ngân hàng trước khi xác nhận.</p>
                      <PaymentActions paymentId={p.id} />
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">Thu khi giao hàng — tự xác nhận khi đơn được đánh dấu hoàn tất.</p>
                  ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {payments.length === 0 && (
        <div className="luno-card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
            <CheckCircle size={28} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">{tab.empty}</p>
        </div>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={countOf(tab.status)}
        basePath="/admin/payments"
        searchParams={{ status: tab.status }}
      />
    </div>
  );
};

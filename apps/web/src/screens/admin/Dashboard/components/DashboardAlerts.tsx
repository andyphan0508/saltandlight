import Link from "next/link";
import { AlertTriangle, ArrowRight, Wallet } from "@/components/admin/Icons";
import type { LowStockVariant } from "@/server/admin/dashboard-lists";

interface DashboardAlertsProps {
  pendingPayments: number;
  lowStockVariants: LowStockVariant[];
}

/** Action alerts: transfers waiting for confirmation and variants about to sell out. Renders nothing when all is clear. */
export const DashboardAlerts = ({ pendingPayments, lowStockVariants }: DashboardAlertsProps) => {
  if (pendingPayments === 0 && lowStockVariants.length === 0) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {pendingPayments > 0 && (
        <Link
          href="/admin/payments"
          className="flex items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 hover:bg-amber-100/60 transition-colors shadow-xs"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 border border-amber-200">
            <Wallet size={20} />
          </span>
          <div className="flex-1 text-xs">
            <span className="font-bold text-slate-900 block text-sm">{pendingPayments} giao dịch chờ xác nhận VietQR</span>
            <span className="text-slate-600 mt-0.5 block">Khách hàng đã chuyển khoản, nhấp để kiểm tra và duyệt đơn</span>
          </div>
          <ArrowRight size={16} className="text-amber-700" />
        </Link>
      )}

      {lowStockVariants.length > 0 && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
            <AlertTriangle size={16} /> Cảnh báo sắp hết hàng ({lowStockVariants.length} phân loại)
          </div>
          <div className="mt-3 space-y-2">
            {lowStockVariants.map((variant) => (
              <Link
                key={variant.id}
                href={`/admin/products/${variant.productId}`}
                className="flex items-center justify-between text-xs hover:underline"
              >
                <span className="truncate font-semibold text-slate-700">
                  {variant.product.name} ({[variant.color, variant.size].filter(Boolean).join(" - ")})
                </span>
                <span className="font-bold text-rose-600">chỉ còn {variant.stockQuantity}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { getDashboardStats } from "@/lib/stats";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  processing: "Đang xử lý",
  on_hold: "Tạm giữ",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Tổng quan</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Doanh thu tháng này" value={formatVND(stats.monthRevenue)} />
        <StatCard label="Chuyển khoản chờ xác nhận" value={String(stats.pendingPayments)} highlight />
        <StatCard
          label="Tổng số đơn hàng"
          value={String(Object.values(stats.statusCounts).reduce((a, b) => a + b, 0))}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="text-sm font-bold uppercase">Đơn hàng theo trạng thái</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-ink/60">{label}</span>
                <span className="font-semibold">{stats.statusCounts[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="text-sm font-bold uppercase">Sản phẩm bán chạy</h2>
          <div className="mt-4 space-y-2">
            {stats.topProducts.length === 0 && (
              <p className="text-sm text-ink/50">Chưa có dữ liệu.</p>
            )}
            {stats.topProducts.map((p) => (
              <div key={p.name} className="flex justify-between text-sm">
                <span className="text-ink/70">{p.name}</span>
                <span className="font-semibold">{p.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats.pendingPayments > 0 && (
        <Link
          href="/payments"
          className="mt-6 block rounded-2xl bg-mint-100 p-4 text-sm font-semibold hover:bg-mint-200"
        >
          → {stats.pendingPayments} giao dịch chuyển khoản đang chờ xác nhận
        </Link>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-sale/30 bg-sale/5" : "border-ink/10 bg-white"}`}>
      <div className="text-xs font-bold uppercase tracking-wide text-ink/50">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

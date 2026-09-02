import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { getDashboardStats } from "@/lib/stats";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/RevenueChart";
import { StatusBreakdown } from "@/components/StatusBreakdown";
import { SITE_URL } from "@/lib/site-url";
import {
  Wallet,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  ExternalLink,
  Sparkles,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 border-amber-200" },
  processing: { label: "Đang xử lý", className: "bg-sky-50 text-sky-700 border-sky-200" },
  on_hold: { label: "Tạm giữ", className: "bg-slate-100 text-slate-700 border-slate-200" },
  completed: { label: "Hoàn tất", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Đã hủy", className: "bg-slate-100 text-slate-500 border-slate-200" },
  refunded: { label: "Đã hoàn tiền", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const [recentOrders, lowStockVariants] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { customer: true },
    }),
    prisma.productVariant.findMany({
      where: { isActive: true, stockQuantity: { lte: 5 } },
      orderBy: { stockQuantity: "asc" },
      take: 5,
      include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* 1. Luno Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink via-slate-900 to-brand-forest p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-mint-200 backdrop-blur-sm border border-white/10">
              <Sparkles size={13} />
              <span>Bảng Quản Trị Salt &amp; Light 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Chào mừng trở lại, Quản trị viên! 👋
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              Dưới đây là tổng quan hoạt động kinh doanh, tình trạng đơn hàng và doanh số bán hàng của thương hiệu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 rounded-full bg-mint-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-ink hover:bg-white transition-all shadow-sm active:scale-95"
            >
              <Plus size={15} />
              <span>Thêm sản phẩm mới</span>
            </Link>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/25 transition-all backdrop-blur-sm border border-white/10"
            >
              <span>Xem storefront</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Doanh thu tháng này"
          value={formatVND(stats.monthRevenue)}
          icon={<Wallet size={18} />}
          tone="forest"
          trend={
            stats.revenueChangePct != null
              ? {
                  value: `${Math.abs(stats.revenueChangePct)}% so với tháng trước`,
                  positive: stats.revenueChangePct >= 0,
                }
              : undefined
          }
          subtext="Doanh số tính theo tháng hiện tại"
        />
        <StatCard
          label="Đơn hàng tháng này"
          value={String(stats.monthOrderCount)}
          icon={<ShoppingCart size={18} />}
          tone="blue"
          subtext="Tổng số đơn phát sinh"
        />
        <StatCard
          label="Sản phẩm đang bán"
          value={String(stats.totalProducts)}
          icon={<Package size={18} />}
          tone="gold"
          subtext="Sản phẩm đang hiển thị"
        />
        <StatCard
          label="Tổng khách hàng"
          value={String(stats.totalCustomers)}
          icon={<Users size={18} />}
          tone="purple"
          subtext="Khách hàng toàn hệ thống"
        />
      </div>

      {/* 3. Charts & Analytics Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* 14-day Revenue Chart */}
        <div className="luno-card p-6 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Doanh thu 14 ngày gần nhất
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Biểu đồ tăng trưởng doanh số hàng ngày</p>
            </div>
            <span className="rounded-full bg-mint-100 px-3 py-1 text-[10px] font-bold text-brand-forest">
              14 Ngày Qua
            </span>
          </div>
          <div className="mt-4">
            <RevenueChart series={stats.revenueSeries} />
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="luno-card p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Đơn hàng theo trạng thái
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Tỷ lệ phân bổ trạng thái</p>
            </div>
          </div>
          <div className="mt-5">
            <StatusBreakdown counts={stats.statusCounts} />
          </div>
        </div>
      </div>

      {/* 4. Recent Orders & Best Selling Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="luno-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Đơn hàng gần đây
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Các đơn hàng mới nhất cần xử lý</p>
            </div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-3 divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-2">Mã đơn</th>
                  <th className="py-2.5 px-2">Khách hàng</th>
                  <th className="py-2.5 px-2">Tổng tiền</th>
                  <th className="py-2.5 px-2">Trạng thái</th>
                  <th className="py-2.5 px-2 text-right">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((o) => {
                  const badge = STATUS_BADGES[o.status] ?? {
                    label: o.status,
                    className: "bg-slate-100 text-slate-600 border-slate-200",
                  };
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-2">
                        <Link
                          href={`/orders/${o.id}`}
                          className="font-black text-ink group-hover:text-brand-forest"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-700">{o.customer.fullName}</div>
                        <div className="text-[11px] text-slate-400">{o.customer.phone}</div>
                      </td>
                      <td className="py-3 px-2 font-black text-brand-forest">
                        {formatVND(Number(o.total))}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-slate-400">
                        {o.createdAt.toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      Chưa có đơn hàng nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="luno-card p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Sản phẩm bán chạy
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Top sản phẩm có lượng mua cao nhất</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {stats.topProducts.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">Chưa có dữ liệu sản phẩm.</p>
            )}
            {stats.topProducts.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors"
              >
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                    i === 0
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : i === 1
                      ? "bg-slate-200 text-slate-700"
                      : i === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  #{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="truncate text-xs font-bold text-slate-800 block">
                    {p.name}
                  </span>
                  <span className="text-[11px] text-slate-400">Thời trang Cơ Đốc</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-700 border border-emerald-100">
                  {p.quantity} đã bán
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Warning & Action Alerts */}
      {(stats.pendingPayments > 0 || lowStockVariants.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.pendingPayments > 0 && (
            <Link
              href="/payments"
              className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 hover:bg-amber-100/60 transition-colors shadow-xs"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
                <Wallet size={20} />
              </span>
              <div className="flex-1 text-xs">
                <span className="font-black text-slate-900 block text-sm">
                  {stats.pendingPayments} giao dịch chờ xác nhận VietQR
                </span>
                <span className="text-slate-600 mt-0.5 block">
                  Khách hàng đã chuyển khoản, nhấp để kiểm tra và duyệt đơn
                </span>
              </div>
              <ArrowRight size={16} className="text-amber-700" />
            </Link>
          )}

          {lowStockVariants.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-700">
                <AlertTriangle size={16} /> Cảnh báo sắp hết hàng ({lowStockVariants.length} phân loại)
              </div>
              <div className="mt-3 space-y-2">
                {lowStockVariants.map((v) => (
                  <Link
                    key={v.id}
                    href={`/products/${v.productId}`}
                    className="flex items-center justify-between text-xs hover:underline"
                  >
                    <span className="truncate font-semibold text-slate-700">
                      {v.product.name} ({[v.color, v.size].filter(Boolean).join(" - ")})
                    </span>
                    <span className="font-black text-rose-600">chỉ còn {v.stockQuantity}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

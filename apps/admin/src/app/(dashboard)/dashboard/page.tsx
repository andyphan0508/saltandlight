import Link from "next/link";
import { prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { getDashboardStats } from "@/lib/stats";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/RevenueChart";
import { StatusBreakdown } from "@/components/StatusBreakdown";
import { Wallet, ShoppingCart, Package, Users, AlertTriangle, ArrowRight } from "@/components/Icons";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const [recentOrders, lowStockVariants] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
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
    <div>
      <PageHeader
        title="Tổng quan"
        subtitle={`Cập nhật lúc ${new Date().toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Doanh thu tháng này"
          value={formatVND(stats.monthRevenue)}
          icon={<Wallet size={17} />}
          tone="forest"
          trend={
            stats.revenueChangePct != null
              ? { value: `${Math.abs(stats.revenueChangePct)}% so với tháng trước`, positive: stats.revenueChangePct >= 0 }
              : undefined
          }
        />
        <StatCard
          label="Đơn hàng tháng này"
          value={String(stats.monthOrderCount)}
          icon={<ShoppingCart size={17} />}
          tone="ink"
        />
        <StatCard
          label="Sản phẩm đang bán"
          value={String(stats.totalProducts)}
          icon={<Package size={17} />}
          tone="gold"
        />
        <StatCard
          label="Tổng khách hàng"
          value={String(stats.totalCustomers)}
          icon={<Users size={17} />}
          tone="ink"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-ink/70">Doanh thu 14 ngày gần nhất</h2>
          </div>
          <div className="mt-6">
            <RevenueChart series={stats.revenueSeries} />
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <h2 className="text-sm font-bold uppercase text-ink/70">Đơn hàng theo trạng thái</h2>
          <div className="mt-5">
            <StatusBreakdown counts={stats.statusCounts} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-ink/70">Đơn hàng gần đây</h2>
            <Link href="/orders" className="flex items-center gap-1 text-xs font-semibold text-brand-forest hover:underline">
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-ink/5">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-mint-50/50 rounded-lg px-2 -mx-2"
              >
                <div>
                  <div className="font-semibold text-ink">{o.orderNumber}</div>
                  <div className="text-xs text-ink/50">{o.customer.fullName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-ink">{formatVND(Number(o.total))}</div>
                  <div className="text-[10px] uppercase text-ink/40">
                    {o.createdAt.toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <p className="py-6 text-center text-sm text-ink/40">Chưa có đơn hàng nào.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <h2 className="text-sm font-bold uppercase text-ink/70">Sản phẩm bán chạy</h2>
          <div className="mt-4 space-y-3">
            {stats.topProducts.length === 0 && <p className="text-sm text-ink/40">Chưa có dữ liệu.</p>}
            {stats.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-mint-100 text-[10px] font-bold text-brand-forest">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm text-ink/80">{p.name}</span>
                <span className="text-xs font-bold text-ink">{p.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(stats.pendingPayments > 0 || lowStockVariants.length > 0) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {stats.pendingPayments > 0 && (
            <Link
              href="/payments"
              className="flex items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-50 p-4 hover:bg-gold-100/60"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                <Wallet size={16} />
              </span>
              <div className="flex-1 text-sm">
                <span className="font-bold text-ink">{stats.pendingPayments} giao dịch</span>{" "}
                <span className="text-ink/60">đang chờ xác nhận chuyển khoản</span>
              </div>
              <ArrowRight size={13} />
            </Link>
          )}
          {lowStockVariants.length > 0 && (
            <div className="rounded-2xl border border-sale/20 bg-sale-light/40 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-sale">
                <AlertTriangle size={16} /> Sắp hết hàng
              </div>
              <div className="mt-2 space-y-1.5">
                {lowStockVariants.map((v) => (
                  <Link
                    key={v.id}
                    href={`/products/${v.productId}`}
                    className="flex items-center justify-between text-xs hover:underline"
                  >
                    <span className="truncate text-ink/70">
                      {v.product.name} {[v.color, v.size].filter(Boolean).join("/")}
                    </span>
                    <span className="font-bold text-sale">còn {v.stockQuantity}</span>
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

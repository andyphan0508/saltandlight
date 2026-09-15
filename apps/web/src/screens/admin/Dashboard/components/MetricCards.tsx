import { formatVND } from "@saltandlight/domain";
import { Package, ShoppingCart, Users, Wallet } from "@/components/admin/Icons";
import type { getDashboardStats } from "@/server/admin/stats";
import { StatCard } from "./StatCard";

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

/** Month revenue (with change vs last month), month orders, live products and customers. */
export const MetricCards = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      label="Doanh thu tháng này"
      value={formatVND(stats.monthRevenue)}
      icon={<Wallet size={19} />}
      tone="forest"
      trend={
        stats.revenueChangePct != null
          ? { value: `${Math.abs(stats.revenueChangePct)}% so với tháng trước`, positive: stats.revenueChangePct >= 0 }
          : undefined
      }
      subtext="Doanh số tính theo tháng hiện tại"
    />
    <StatCard
      label="Đơn hàng tháng này"
      value={String(stats.monthOrderCount)}
      icon={<ShoppingCart size={19} />}
      tone="blue"
      subtext="Tổng số đơn phát sinh"
    />
    <StatCard
      label="Sản phẩm đang bán"
      value={String(stats.totalProducts)}
      icon={<Package size={19} />}
      tone="gold"
      subtext="Sản phẩm đang hiển thị"
    />
    <StatCard
      label="Tổng khách hàng"
      value={String(stats.totalCustomers)}
      icon={<Users size={19} />}
      tone="purple"
      subtext="Khách hàng toàn hệ thống"
    />
  </div>
);

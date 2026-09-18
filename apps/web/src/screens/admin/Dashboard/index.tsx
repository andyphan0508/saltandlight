import Link from "next/link";
import { ArrowRight } from "@/components/admin/Icons";
import { StatsSwitch } from "@/components/admin/StatsSwitch";
import { getLowStockVariants, getRecentOrders } from "@/server/admin/dashboard-lists";
import { getDashboardStats } from "@/server/admin/stats";
import { DashboardAlerts } from "./components/DashboardAlerts";
import { DashboardCard } from "./components/DashboardCard";
import { EditorShortcutCard } from "./components/EditorShortcutCard";
import { MetricCards } from "./components/MetricCards";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import { RevenueChart } from "./components/RevenueChart";
import { StatusBreakdown } from "./components/StatusBreakdown";
import { TopProductsList } from "./components/TopProductsList";
import { WelcomeBanner } from "./components/WelcomeBanner";

const DashboardPage = async () => {
  // Stats first, then the two lists: keeps concurrent queries within the small database pool
  const stats = await getDashboardStats();
  const [recentOrders, lowStockVariants] = await Promise.all([getRecentOrders(), getLowStockVariants()]);

  return (
    // Flex + order: on phones the numbers and anything needing action come first
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="max-md:-order-3 lg:hidden">
        <StatsSwitch current="/admin/dashboard" />
      </div>

      <div className="max-sm:hidden">
        <WelcomeBanner />
      </div>

      <div className="max-md:-order-2">
        <MetricCards stats={stats} />
      </div>

      <div className="max-md:hidden">
        <EditorShortcutCard />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DashboardCard
          title="Doanh thu 14 ngày gần nhất"
          subtitle="Biểu đồ tăng trưởng doanh số hàng ngày"
          className="xl:col-span-2"
          aside={<span className="rounded-full bg-mint-100 px-3.5 py-1 text-[10px] font-bold text-brand-forest">14 Ngày Qua</span>}
        >
          <RevenueChart series={stats.revenueSeries} />
        </DashboardCard>

        <DashboardCard title="Đơn hàng theo trạng thái" subtitle="Tỷ lệ phân bổ trạng thái">
          <StatusBreakdown counts={stats.statusCounts} />
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardCard
          title="Đơn hàng gần đây"
          subtitle="Các đơn hàng mới nhất cần xử lý"
          className="lg:col-span-2"
          aside={
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline">
              <span>Xem tất cả</span>
              <ArrowRight size={13} />
            </Link>
          }
        >
          <RecentOrdersTable orders={recentOrders} />
        </DashboardCard>

        <DashboardCard title="Sản phẩm bán chạy" subtitle="Top sản phẩm có lượng mua cao nhất">
          <TopProductsList products={stats.topProducts} />
        </DashboardCard>
      </div>

      <div className="empty:hidden max-md:-order-1">
        <DashboardAlerts pendingPayments={stats.pendingPayments} lowStockVariants={lowStockVariants} />
      </div>
    </div>
  );
};

export default DashboardPage;

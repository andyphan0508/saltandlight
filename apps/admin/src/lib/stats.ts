import { prisma } from "@saltandlight/db";

const REVENUE_STATUSES = ["processing", "completed"] as const;

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [
    revenueAgg,
    prevRevenueAgg,
    statusCounts,
    pendingPayments,
    topProducts,
    totalCustomers,
    totalProducts,
    lowStockCount,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      _count: { _all: true },
      where: { createdAt: { gte: monthStart }, status: { in: [...REVENUE_STATUSES] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: prevMonthStart, lt: monthStart },
        status: { in: [...REVENUE_STATUSES] },
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.paymentTransaction.count({ where: { status: "awaiting_confirmation" } }),
    prisma.orderItem.groupBy({
      by: ["productNameSnapshot"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.customer.count(),
    prisma.product.count({ where: { status: "published" } }),
    prisma.productVariant.count({ where: { isActive: true, stockQuantity: { lte: 5 } } }),
    prisma.order.findMany({
      where: { createdAt: { gte: fourteenDaysAgo }, status: { in: [...REVENUE_STATUSES] } },
      select: { createdAt: true, total: true },
    }),
  ]);

  const byDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of recentOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + Number(o.total));
  }
  const revenueSeries = Array.from(byDay.entries()).map(([date, total]) => ({ date, total }));

  const monthRevenue = Number(revenueAgg._sum.total ?? 0);
  const prevMonthRevenue = Number(prevRevenueAgg._sum.total ?? 0);
  const revenueChangePct =
    prevMonthRevenue > 0 ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : null;

  return {
    monthRevenue,
    monthOrderCount: revenueAgg._count._all,
    revenueChangePct,
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all])),
    pendingPayments,
    topProducts: topProducts.map((p) => ({
      name: p.productNameSnapshot,
      quantity: p._sum.quantity ?? 0,
    })),
    totalCustomers,
    totalProducts,
    lowStockCount,
    revenueSeries,
  };
}

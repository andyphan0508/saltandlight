import { prisma } from "@saltandlight/db";

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenueAgg, statusCounts, pendingPayments, topProducts] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: monthStart },
        status: { in: ["processing", "completed"] },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.paymentTransaction.count({ where: { status: "awaiting_confirmation" } }),
    prisma.orderItem.groupBy({
      by: ["productNameSnapshot"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return {
    monthRevenue: Number(revenueAgg._sum.total ?? 0),
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all])),
    pendingPayments,
    topProducts: topProducts.map((p) => ({
      name: p.productNameSnapshot,
      quantity: p._sum.quantity ?? 0,
    })),
  };
}

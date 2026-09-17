import { prisma } from "@saltandlight/db";

export interface OrderStats {
  orders: number;
  confirmedOrders: number;
  buyers: number;
  itemsSold: number;
  revenue: number;
  /** Confirmed ÷ placed. */
  confirmationRate: number;
  /** Buyers in the window who had ordered at least once before it. */
  repeatBuyerRate: number;
  codOrders: number;
  transferOrders: number;
}

const CONFIRMED = ["processing", "completed"] as const;

/**
 * Order figures straight from Postgres — the source of truth, unaffected by ad
 * blockers or the tracker's 3-month retention. Four small aggregate queries.
 */
export const getOrderStats = async (start: Date, end: Date): Promise<OrderStats> => {
  const inWindow = { createdAt: { gte: start, lt: end } };

  const [orders, items, payments] = await Promise.all([
    prisma.order.findMany({
      where: inWindow,
      select: { status: true, total: true, customer: { select: { phone: true } } },
    }),
    prisma.orderItem.aggregate({
      where: { order: { ...inWindow, status: { notIn: ["cancelled", "refunded"] } } },
      _sum: { quantity: true },
    }),
    prisma.paymentTransaction.groupBy({ by: ["method"], where: { order: inWindow }, _count: { _all: true } }),
  ]);

  const phones = [...new Set(orders.map((o) => o.customer.phone).filter((p): p is string => Boolean(p)))];
  const returning =
    phones.length === 0
      ? 0
      : (
          await prisma.customer.findMany({
            where: { phone: { in: phones }, orders: { some: { createdAt: { lt: start } } } },
            select: { phone: true },
            distinct: ["phone"],
          })
        ).length;

  const confirmed = orders.filter((o) => (CONFIRMED as readonly string[]).includes(o.status));
  const methodCount = (method: string) => payments.find((p) => p.method === method)?._count._all ?? 0;

  return {
    orders: orders.length,
    confirmedOrders: confirmed.length,
    buyers: phones.length,
    itemsSold: items._sum.quantity ?? 0,
    revenue: confirmed.reduce((sum, o) => sum + Number(o.total), 0),
    confirmationRate: orders.length ? confirmed.length / orders.length : 0,
    repeatBuyerRate: phones.length ? returning / phones.length : 0,
    codOrders: methodCount("cod"),
    transferOrders: methodCount("bank_transfer"),
  };
};

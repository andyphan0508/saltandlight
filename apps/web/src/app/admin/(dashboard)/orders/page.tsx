import { prisma } from "@saltandlight/db";
import { OrdersView, type OrderRow } from "@/components/admin";

const PAGE_SIZE = 15;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string; q?: string };
}) {
  const status = searchParams.status;
  const query = searchParams.q?.trim();
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: any = {};
  if (status) where.status = status;
  if (query) {
    where.OR = [
      { orderNumber: { contains: query, mode: "insensitive" } },
      { customer: { fullName: { contains: query, mode: "insensitive" } } },
      { customer: { phone: { contains: query } } },
    ];
  }

  const [orders, total, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countByStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all]));
  const totalAll = statusCounts.reduce((sum, s) => sum + s._count._all, 0);

  return (
    <OrdersView
      orders={orders as OrderRow[]}
      total={total}
      totalAll={totalAll}
      countByStatus={countByStatus}
      page={page}
      pageSize={PAGE_SIZE}
      status={status}
      query={query}
    />
  );
}

import { prisma } from "@saltandlight/db";
import { PAYMENT_TABS, PaymentsManager } from "./components/PaymentsManager";

const PAGE_SIZE = 20;

const PaymentsPage = async ({ searchParams }: { searchParams: { status?: string; page?: string } }) => {
  const tab = PAYMENT_TABS.find((t) => t.status === searchParams.status) ?? PAYMENT_TABS[0]!;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const isUnpaid = tab.status === "awaiting_confirmation";
  const where = { status: tab.status };

  const [payments, counts, sum] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      // Unpaid: oldest first, it has waited longest. Settled: most recent first.
      orderBy: isUnpaid ? { createdAt: "asc" } : [{ confirmedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        amount: true,
        method: true,
        createdAt: true,
        confirmedAt: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: { select: { fullName: true, phone: true } },
          },
        },
      },
    }),
    prisma.paymentTransaction.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.paymentTransaction.aggregate({ where, _sum: { amount: true } }),
  ]);

  return (
    <PaymentsManager
      tab={tab}
      payments={payments}
      countByStatus={Object.fromEntries(counts.map((c) => [c.status, c._count._all]))}
      sum={Number(sum._sum.amount ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
    />
  );
};

export default PaymentsPage;

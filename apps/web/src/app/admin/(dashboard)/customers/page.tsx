import { prisma } from "@saltandlight/db";
import { CustomersView } from "@/components/admin";

const PAGE_SIZE = 15;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q?.trim();
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: any = q
    ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <CustomersView
      customers={customers}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      q={q}
    />
  );
}

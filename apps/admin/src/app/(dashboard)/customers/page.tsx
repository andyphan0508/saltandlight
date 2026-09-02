import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Icons";

const PAGE_SIZE = 15;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q?.trim();
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = q
    ? { OR: [{ fullName: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }] }
    : undefined;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { orders: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <div>
      <PageHeader title="Khách hàng" subtitle={`${total} khách hàng đã từng đặt hàng`} />

      <div className="rounded-2xl border border-ink/10 bg-white shadow-card">
        <form className="relative border-b border-ink/10 p-4">
          <Search size={15} className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm theo tên hoặc số điện thoại…"
            className="w-full max-w-sm rounded-xl border border-ink/15 py-2 pl-9 pr-3 text-sm focus:border-brand-forest focus:outline-none"
          />
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-semibold">Họ tên</th>
                <th className="px-5 py-3 font-semibold">Số điện thoại</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Số đơn hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-mint-50/40">
                  <td className="px-5 py-3 font-medium text-ink">{c.fullName}</td>
                  <td className="px-5 py-3 text-ink/70">{c.phone}</td>
                  <td className="px-5 py-3 text-ink/50">{c.email ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-mint-100 px-2.5 py-1 text-xs font-bold text-brand-forest">
                      {c._count.orders}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-ink/40">
                    Không tìm thấy khách hàng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/customers" searchParams={{ q }} />
      </div>
    </div>
  );
}

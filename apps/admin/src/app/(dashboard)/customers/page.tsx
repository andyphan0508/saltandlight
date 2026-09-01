import { prisma } from "@saltandlight/db";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();
  const customers = await prisma.customer.findMany({
    where: q
      ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Khách hàng</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên hoặc số điện thoại…"
          className="w-full max-w-sm rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Số đơn hàng</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium">{c.fullName}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3 text-ink/60">{c.email ?? "—"}</td>
                <td className="px-4 py-3">{c._count.orders}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                  Không tìm thấy khách hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

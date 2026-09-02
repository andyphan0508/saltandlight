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
      include: { _count: { select: { orders: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý khách hàng"
        subtitle={`Tổng cộng ${total} khách hàng trong hệ thống`}
      />

      <div className="luno-card">
        <form className="relative border-b border-slate-100 p-4 sm:p-5">
          <Search
            size={14}
            className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm theo họ tên, số điện thoại hoặc email…"
            className="w-full max-w-md rounded-full border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs font-medium text-ink placeholder:text-slate-400 focus:border-brand-forest focus:bg-white focus:outline-none transition-all"
          />
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Số điện thoại</th>
                <th className="px-5 py-3.5">Email liên hệ</th>
                <th className="px-5 py-3.5 text-right">Lượt đặt hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => {
                const initial = (c.fullName || "K").charAt(0).toUpperCase();
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-mint-100 text-brand-forest font-black text-xs border border-mint-200">
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{c.fullName}</div>
                          <div className="text-[11px] text-slate-400">Khách hàng thành viên</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{c.phone}</td>
                    <td className="px-5 py-3.5 text-slate-500">{c.email ?? "Chưa cập nhật"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-block rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-black text-emerald-700 border border-emerald-100">
                        {c._count.orders} đơn
                      </span>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-slate-400">
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            basePath="/customers"
            searchParams={{ q }}
          />
        </div>
      </div>
    </div>
  );
}

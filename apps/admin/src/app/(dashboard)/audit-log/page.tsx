import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 20;

const ACTION_LABEL: Record<string, string> = {
  "product.create": "Tạo sản phẩm",
  "product.update": "Cập nhật sản phẩm",
  "product.delete": "Xóa/lưu trữ sản phẩm",
  "order.status_change": "Đổi trạng thái đơn hàng",
  "payment.confirm": "Xác nhận thanh toán",
  "payment.reject": "Từ chối thanh toán",
  "shipping_method.update": "Cập nhật vận chuyển",
  "admin_user.invite": "Mời nhân viên",
  "admin_user.update": "Cập nhật nhân viên",
};

export default async function AuditLogPage({ searchParams }: { searchParams: { page?: string } }) {
  const current = await getCurrentAdminUser();
  if (!current || current.role !== "owner") redirect("/dashboard");

  const page = Math.max(1, Number(searchParams.page) || 1);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { adminUser: true },
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <div>
      <PageHeader title="Nhật ký hoạt động" subtitle="Theo dõi ai đã thay đổi gì trong hệ thống" />

      <div className="rounded-2xl border border-ink/10 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-semibold">Thời gian</th>
                <th className="px-5 py-3 font-semibold">Người thực hiện</th>
                <th className="px-5 py-3 font-semibold">Hành động</th>
                <th className="px-5 py-3 font-semibold">Đối tượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-mint-50/40">
                  <td className="px-5 py-3 text-ink/50">{log.createdAt.toLocaleString("vi-VN")}</td>
                  <td className="px-5 py-3 text-ink/80">{log.adminUser?.email ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink/70">
                      {ACTION_LABEL[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink/40">
                    {log.entityType}#{log.entityId.slice(0, 8)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-ink/40">
                    Chưa có hoạt động nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/audit-log" />
      </div>
    </div>
  );
}

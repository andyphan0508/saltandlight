import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 20;

const ACTION_LABEL: Record<string, { label: string; className: string }> = {
  "product.create": { label: "Tạo sản phẩm mới", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "product.update": { label: "Cập nhật sản phẩm", className: "bg-sky-50 text-sky-700 border-sky-200" },
  "product.delete": { label: "Xóa/lưu trữ sản phẩm", className: "bg-rose-50 text-rose-700 border-rose-200" },
  "order.status_change": { label: "Đổi trạng thái đơn", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  "payment.confirm": { label: "Xác nhận thanh toán", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "payment.reject": { label: "Từ chối thanh toán", className: "bg-rose-50 text-rose-700 border-rose-200" },
  "shipping_method.update": { label: "Cập nhật vận chuyển", className: "bg-amber-50 text-amber-700 border-amber-200" },
  "admin_user.invite": { label: "Mời nhân viên mới", className: "bg-purple-50 text-purple-700 border-purple-200" },
  "admin_user.update": { label: "Cập nhật quyền hạn", className: "bg-slate-100 text-slate-700 border-slate-200" },
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
      include: { adminUser: { select: { fullName: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký hoạt động hệ thống"
        subtitle="Lịch sử các thao tác thay đổi dữ liệu của ban quản trị (Audit Log)"
      />

      <div className="luno-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Thời gian</th>
                <th className="px-5 py-3.5">Người thực hiện</th>
                <th className="px-5 py-3.5">Hành động</th>
                <th className="px-5 py-3.5 text-right">Đối tượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const actionMeta = ACTION_LABEL[log.action] ?? {
                  label: log.action,
                  className: "bg-slate-100 text-slate-700 border-slate-200",
                };
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-500">
                      {log.createdAt.toLocaleString("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800">
                        {log.adminUser?.fullName || log.adminUser?.email || "Hệ thống"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${actionMeta.className}`}
                      >
                        {actionMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-[11px] text-slate-400">
                      {log.entityType}#{log.entityId.slice(0, 8)}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-slate-400">
                    Chưa có nhật ký hoạt động nào được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4">
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/audit-log" />
        </div>
      </div>
    </div>
  );
}

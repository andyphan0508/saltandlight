import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/auth";

export default async function AuditLogPage() {
  const current = await getCurrentAdminUser();
  if (!current || current.role !== "owner") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { adminUser: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Nhật ký hoạt động</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Người thực hiện</th>
              <th className="px-4 py-3">Hành động</th>
              <th className="px-4 py-3">Đối tượng</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 text-ink/60">{log.createdAt.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3">{log.adminUser?.email ?? "—"}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3 text-ink/60">
                  {log.entityType}#{log.entityId.slice(0, 8)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                  Chưa có hoạt động nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

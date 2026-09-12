import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { UsersManager } from "@/components/admin/UsersManager";
import { PageHeader } from "@/components/admin/PageHeader";

const PAGE_SIZE = 15;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const current = await getCurrentAdminUser();
  if (!current || current.role !== "owner") redirect("/admin/dashboard");

  const page = Math.max(1, Number(searchParams.page) || 1);

  const [users, total] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.adminUser.count(),
  ]);

  return (
    <div>
      <PageHeader title="Nhân viên" subtitle="Chỉ chủ shop (owner) mới quản lý được tài khoản nhân viên" />
      <UsersManager
        users={users}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        currentUserId={current.id}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { UsersManager } from "@/components/admin/UsersManager";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function UsersPage() {
  const current = await getCurrentAdminUser();
  if (!current || current.role !== "owner") redirect("/admin/dashboard");

  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader title="Nhân viên" subtitle="Chỉ chủ shop (owner) mới quản lý được tài khoản nhân viên" />
      <UsersManager users={users} currentUserId={current.id} />
    </div>
  );
}

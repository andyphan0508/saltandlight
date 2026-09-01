import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/auth";
import { UsersManager } from "@/components/UsersManager";

export default async function UsersPage() {
  const current = await getCurrentAdminUser();
  if (!current || current.role !== "owner") redirect("/dashboard");

  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Nhân viên</h1>
      <div className="mt-6">
        <UsersManager users={users} currentUserId={current.id} />
      </div>
    </div>
  );
}

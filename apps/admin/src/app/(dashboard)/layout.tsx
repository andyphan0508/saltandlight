import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/login");

  return (
    <div className="flex">
      <Sidebar role={admin.role} email={admin.email} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

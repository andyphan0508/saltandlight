import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/login");

  return (
    <div className="flex bg-cream-50 min-h-screen">
      <Sidebar role={admin.role} email={admin.email} fullName={admin.fullName} />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-[1600px]">{children}</main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { AdminHeader } from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/login?unauthorized=true");

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      {/* Luno Modern Sidebar */}
      <Sidebar role={admin.role} email={admin.email} fullName={admin.fullName} />

      {/* Main Content Area with Header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader role={admin.role} email={admin.email} fullName={admin.fullName} />
        <main className="flex-1 overflow-y-auto p-5 sm:p-7 max-w-[1600px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

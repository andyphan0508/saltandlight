import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/server/admin/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderInboxFab } from "@/components/admin/OrderInboxFab";
import { MobileTabBar } from "@/components/admin/MobileTabBar";

export const dynamic = "force-dynamic";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/admin/login?unauthorized=true");

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#f8f9fa]">
      {/* Luno Modern Sidebar */}
      <Sidebar role={admin.role} email={admin.email} fullName={admin.fullName} />

      {/* Main Content Area with Header */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AdminHeader role={admin.role} email={admin.email} fullName={admin.fullName} />
        <main className="flex-1 overflow-y-auto w-full min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12">
          <div className="w-full min-w-0">
            {children}
          </div>
          {/* Keeps the last row clear of the mobile tab bar */}
          <div className="h-24 lg:hidden" aria-hidden="true" />
        </main>
      </div>
      <OrderInboxFab />
      <MobileTabBar role={admin.role} />
    </div>
  );
};

export default DashboardLayout;

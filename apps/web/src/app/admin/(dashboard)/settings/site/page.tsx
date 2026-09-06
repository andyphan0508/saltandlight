import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { resolveSiteSettings } from "@/lib/site-settings-types";
import { SiteSettingsForm } from "./SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/admin/login");

  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const initialSettings = resolveSiteSettings(row);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Header & Footer"
        subtitle="Chỉnh logo, kích thước logo, menu điều hướng và nội dung chân trang — xem trước trực tiếp trước khi lưu"
      />
      <SiteSettingsForm initialSettings={initialSettings} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { PaymentSettingsForm } from "./PaymentSettingsForm";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/admin/login");

  const settings = await prisma.paymentSettings.findUnique({ where: { id: "default" } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài Đặt Thanh Toán"
        subtitle="Cấu hình mã QR, hướng dẫn chuyển khoản và thông báo hiển thị cho khách sau khi đặt hàng"
      />
      <PaymentSettingsForm
        initialSettings={
          settings
            ? {
                qrImageUrl: settings.qrImageUrl,
                transferNote: settings.transferNote,
                showThankYouOnly: settings.showThankYouOnly,
                thankYouMessage: settings.thankYouMessage,
              }
            : null
        }
      />
    </div>
  );
}

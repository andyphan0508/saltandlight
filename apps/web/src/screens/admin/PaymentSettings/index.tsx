import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/server/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { PaymentSettingsForm } from "./components/PaymentSettingsForm";

const PaymentSettingsPage = async () => {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/admin/login");

  const settings = await prisma.paymentSettings.findUnique({ where: { id: "default" } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài Đặt Thanh Toán"
        subtitle="Mã QR và thông tin chuyển khoản hiện cho khách sau khi đặt hàng"
      />
      <PaymentSettingsForm
        initialSettings={settings ? { qrImageUrl: settings.qrImageUrl, transferNote: settings.transferNote } : null}
      />
    </div>
  );
};

export default PaymentSettingsPage;

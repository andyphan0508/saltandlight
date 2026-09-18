import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { DEFAULT_ORDER_EMAIL, ORDER_EMAIL_ID, type OrderEmailTemplate } from "@/helpers/order-email";
import { getCachedSiteSettings } from "@/server/queries";
import { EmailTemplateEditor } from "./components/EmailTemplateEditor";

export const dynamic = "force-dynamic";

const EmailTemplatePage = async () => {
  let template: OrderEmailTemplate = DEFAULT_ORDER_EMAIL;
  let isTableMissing = false;
  try {
    const row = await prisma.emailTemplate.findUnique({ where: { id: ORDER_EMAIL_ID } });
    if (row) {
      const { id: _id, updatedAt: _updatedAt, ...saved } = row;
      template = saved;
    }
  } catch (err) {
    console.error("[admin/email-template] load failed:", err);
    isTableMissing = true;
  }
  const settings = await getCachedSiteSettings().catch(() => null);

  return (
    <div className="space-y-6">
      <PageHeader title="Mẫu email đơn hàng" subtitle="Email khách nhận ngay khi đặt hàng xong" />
      {isTableMissing && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Chưa lưu được mẫu vì cơ sở dữ liệu chưa được cập nhật (chạy <code className="font-mono">pnpm db:deploy</code>). Khách
          vẫn nhận email theo mẫu mặc định bên dưới.
        </p>
      )}
      <EmailTemplateEditor initialTemplate={template} logoPath={settings?.logoUrl || "/images/logo.png"} />
    </div>
  );
};

export default EmailTemplatePage;

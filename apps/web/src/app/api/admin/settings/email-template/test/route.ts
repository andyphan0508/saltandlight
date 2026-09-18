import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, apiError, readAdminJson } from "@/server/admin/auth";
import { orderEmailTemplateSchema } from "@/helpers/admin-schemas";
import { SAMPLE_ORDER } from "@/helpers/order-email";
import { sendTestOrderEmail } from "@/server/email";

export const dynamic = "force-dynamic";

/** Sends the template being edited (saved or not) to the admin's own inbox, filled with a sample order. */
export const POST = async (req: NextRequest) => {
  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  let template: ReturnType<typeof orderEmailTemplateSchema.parse>;
  try {
    admin = await requireAdmin(["owner", "staff"]);
    template = orderEmailTemplateSchema.parse(await readAdminJson(req));
  } catch (err) {
    return apiError(err, "Không gửi được email thử");
  }

  try {
    await sendTestOrderEmail(admin.email, template, SAMPLE_ORDER, req.nextUrl.origin);
    return NextResponse.json({ sentTo: admin.email });
  } catch (err) {
    // Resend's own reason (unverified domain, daily quota…) is what the admin needs to see
    console.error("[email-template/test]", err);
    return NextResponse.json({ error: `Không gửi được: ${err instanceof Error ? err.message : "lỗi không xác định"}` }, { status: 502 });
  }
};

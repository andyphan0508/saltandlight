import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError, readAdminJson } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { orderEmailTemplateSchema } from "@/helpers/admin-schemas";
import { ORDER_EMAIL_ID } from "@/helpers/order-email";
import { invalidateMemoryCache } from "@/server/memory-cache";
import { ORDER_EMAIL_CACHE_KEY } from "@/server/email-template";

export const dynamic = "force-dynamic";

export const PATCH = async (req: NextRequest) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const input = orderEmailTemplateSchema.parse(await readAdminJson(req));

    await prisma.emailTemplate.upsert({
      where: { id: ORDER_EMAIL_ID },
      create: { id: ORDER_EMAIL_ID, ...input },
      update: input,
    });

    await logAudit({
      adminUserId: admin.id,
      action: "email_template.update",
      entityType: "email_template",
      entityId: ORDER_EMAIL_ID,
      metadata: { subject: input.subject, buttonPath: input.buttonPath },
    });

    // Other isolates pick the change up within the loader's 60s cache
    invalidateMemoryCache(ORDER_EMAIL_CACHE_KEY);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "Không thể lưu mẫu email");
  }
};

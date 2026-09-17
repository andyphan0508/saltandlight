import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError, readAdminJson } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { paymentSettingsSchema } from "@/helpers/admin-schemas";
import { invalidateMemoryCache } from "@/server/memory-cache";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "default";

export const PATCH = async (req: NextRequest) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await readAdminJson(req);
    const input = paymentSettingsSchema.parse(body);

    const settings = await prisma.paymentSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...input },
      update: input,
    });

    await logAudit({
      adminUserId: admin.id,
      action: "payment_settings.update",
      entityType: "payment_settings",
      entityId: SETTINGS_ID,
      metadata: { showThankYouOnly: settings.showThankYouOnly, hasQrImage: !!settings.qrImageUrl },
    });

    revalidateTag("payment-settings");
    invalidateMemoryCache("payment-settings");

    return NextResponse.json({ settings });
  } catch (err) {
    return apiError(err, "Không thể lưu cài đặt");
  }
};

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { paymentSettingsSchema } from "@/lib/admin/schemas";
import { invalidateMemoryCache } from "@/lib/memory-cache";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "default";

export async function GET() {
  try {
    await requireAdmin(["owner", "staff"]);
    const settings = await prisma.paymentSettings.findUnique({ where: { id: SETTINGS_ID } });
    return NextResponse.json({ settings });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
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
}

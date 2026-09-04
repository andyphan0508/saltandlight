import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { paymentSettingsSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "default";

export async function GET() {
  try {
    await requireAdmin(["owner", "staff"]);
    const settings = await prisma.paymentSettings.findUnique({ where: { id: SETTINGS_ID } });
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
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

    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("PATCH /api/admin/settings/payment error:", err);
    return NextResponse.json({ error: "Không thể lưu cài đặt" }, { status: 500 });
  }
}

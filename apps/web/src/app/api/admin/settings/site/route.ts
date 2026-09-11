import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { siteSettingsSchema } from "@/lib/admin/schemas";
import { invalidateMemoryCache } from "@/lib/memory-cache";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "default";

export async function GET() {
  try {
    await requireAdmin(["owner", "staff"]);
    const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    return NextResponse.json({ settings });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const input = siteSettingsSchema.parse(body);
    const data = {
      ...input,
      headerNavItems: input.headerNavItems ?? undefined,
      footerSocialLinks: input.footerSocialLinks ?? undefined,
      footerColumns: input.footerColumns ?? undefined,
    };

    const settings = await prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });

    await logAudit({
      adminUserId: admin.id,
      action: "site_settings.update",
      entityType: "site_settings",
      entityId: SETTINGS_ID,
      metadata: { logoSize: settings.logoSize, hasLogo: !!settings.logoUrl },
    });

    revalidateTag("site-settings");
    invalidateMemoryCache("site-settings");

    return NextResponse.json({ settings });
  } catch (err) {
    return apiError(err, "Không thể lưu cài đặt");
  }
}

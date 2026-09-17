import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError, readAdminJson } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { siteSettingsSchema } from "@/helpers/admin-schemas";
import { invalidateMemoryCache } from "@/server/memory-cache";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "default";

export const PATCH = async (req: NextRequest) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await readAdminJson(req);
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
};

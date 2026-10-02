import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError, readAdminJson, AuthError } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { couponCampaignUpdateSchema } from "@/helpers/admin-schemas";

export const dynamic = "force-dynamic";

/** Pause or resume a campaign. Its rule stays as issued: shoppers may already hold the codes. */
export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const { isActive } = couponCampaignUpdateSchema.parse(await readAdminJson(req));
    await prisma.couponCampaign.update({ where: { id: params.id }, data: { isActive } });
    await logAudit({
      adminUserId: admin.id,
      action: isActive ? "coupon_campaign.resume" : "coupon_campaign.pause",
      entityType: "coupon_campaign",
      entityId: params.id,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "Không thể cập nhật đợt mã");
  }
};

/** Only a campaign none of whose codes was used: a used code is part of an order's record. */
export const DELETE = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const used = await prisma.coupon.count({ where: { campaignId: params.id, usedAt: { not: null } } });
    if (used > 0) throw new AuthError(409, "Đợt này đã có mã được dùng, chỉ có thể tạm dừng chứ không xoá được");
    const campaign = await prisma.couponCampaign.delete({ where: { id: params.id } });
    await logAudit({
      adminUserId: admin.id,
      action: "coupon_campaign.delete",
      entityType: "coupon_campaign",
      entityId: params.id,
      metadata: { name: campaign.name },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "Không thể xoá đợt mã");
  }
};

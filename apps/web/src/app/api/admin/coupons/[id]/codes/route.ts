import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError, readAdminJson } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { couponBatchSchema } from "@/helpers/admin-schemas";
import { issueCoupons } from "@/server/coupons";

export const dynamic = "force-dynamic";

/** More codes for an existing campaign, under the same rule. */
export const POST = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const { quantity, prefix } = couponBatchSchema.parse(await readAdminJson(req));
    await prisma.couponCampaign.findUniqueOrThrow({ where: { id: params.id }, select: { id: true } });
    const issued = await issueCoupons(prisma, params.id, quantity, prefix);
    await logAudit({
      adminUserId: admin.id,
      action: "coupon_campaign.add_codes",
      entityType: "coupon_campaign",
      entityId: params.id,
      metadata: { quantity: issued },
    });
    return NextResponse.json({ issued });
  } catch (err) {
    return apiError(err, "Không thể tạo thêm mã");
  }
};

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError, readAdminJson } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { couponCampaignCreateSchema } from "@/helpers/admin-schemas";
import { issueCoupons } from "@/server/coupons";

export const dynamic = "force-dynamic";

/** A new campaign with its first batch of codes, all or nothing. */
export const POST = async (req: NextRequest) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const { quantity, prefix, startsAt, endsAt, maxDiscount, ...rule } = couponCampaignCreateSchema.parse(await readAdminJson(req));

    const campaign = await prisma.$transaction(async (tx) => {
      const created = await tx.couponCampaign.create({
        data: {
          ...rule,
          // A cap only means something on a percent discount
          maxDiscount: rule.discountType === "percent" ? (maxDiscount ?? null) : null,
          discountValue: rule.discountType === "free_shipping" ? 0 : rule.discountValue,
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
        },
      });
      await issueCoupons(tx, created.id, quantity, prefix);
      return created;
    });

    await logAudit({
      adminUserId: admin.id,
      action: "coupon_campaign.create",
      entityType: "coupon_campaign",
      entityId: campaign.id,
      metadata: { name: campaign.name, quantity, discountType: campaign.discountType },
    });

    return NextResponse.json({ id: campaign.id }, { status: 201 });
  } catch (err) {
    return apiError(err, "Không thể tạo đợt mã giảm giá");
  }
};

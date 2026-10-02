import { prisma, type CouponCampaign, type Prisma } from "@saltandlight/db";
import { couponDiscount, generateCouponCodes, normalizeCouponCode, type CouponCart, type CouponResult, type CouponRule } from "@/helpers/coupon";

export const toCouponRule = (campaign: CouponCampaign): CouponRule => ({
  discountType: campaign.discountType,
  discountValue: Number(campaign.discountValue),
  maxDiscount: campaign.maxDiscount == null ? null : Number(campaign.maxDiscount),
  minOrderTotal: Number(campaign.minOrderTotal),
  productIds: campaign.productIds,
  startsAt: campaign.startsAt,
  endsAt: campaign.endsAt,
  isActive: campaign.isActive,
});

/**
 * Looks a typed code up and applies its campaign's rule to the cart. Read-only: the code
 * is only used up when an order is created (see /api/orders), so a shopper can try a code
 * in the cart without spending it.
 */
export const evaluateCoupon = async (
  rawCode: string,
  cart: CouponCart,
  db: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<{ code: string; result: CouponResult }> => {
  const code = normalizeCouponCode(rawCode);
  const coupon = code ? await db.coupon.findUnique({ where: { code }, include: { campaign: true } }) : null;
  if (!coupon) return { code, result: { ok: false, reason: "not_found" } };
  if (coupon.usedAt) return { code, result: { ok: false, reason: "used" } };
  return { code, result: couponDiscount(toCouponRule(coupon.campaign), cart) };
};

/**
 * Adds `quantity` fresh codes to a campaign. A clash with an existing code (vanishingly
 * rare at ~10¹² combinations) is skipped by the unique index and made up on the next pass.
 */
export const issueCoupons = async (
  db: Prisma.TransactionClient | typeof prisma,
  campaignId: string,
  quantity: number,
  prefix: string,
) => {
  let issued = 0;
  for (let pass = 0; pass < 5 && issued < quantity; pass++) {
    const codes = generateCouponCodes(quantity - issued, prefix);
    const { count } = await db.coupon.createMany({ data: codes.map((code) => ({ campaignId, code })), skipDuplicates: true });
    issued += count;
  }
  if (issued < quantity) throw new Error("Không tạo đủ số mã, vui lòng thử lại");
  return issued;
};

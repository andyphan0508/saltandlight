import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { campaignStatus } from "@/helpers/coupon";
import { CouponsManager, type CampaignRow } from "./components/CouponsManager";

export const dynamic = "force-dynamic";

const CouponsPage = async () => {
  const [campaigns, usage, products] = await Promise.all([
    prisma.couponCampaign.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { coupons: true } } } }),
    prisma.coupon.groupBy({ by: ["campaignId"], where: { usedAt: { not: null } }, _count: { _all: true } }),
    prisma.product.findMany({ where: { status: "published" }, orderBy: { name: "asc" }, select: { id: true, name: true, minPrice: true } }),
  ]);
  const usedBy = new Map(usage.map((u) => [u.campaignId, u._count._all]));

  const rows: CampaignRow[] = campaigns.map((c) => {
    const used = usedBy.get(c.id) ?? 0;
    return {
      id: c.id,
      name: c.name,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      maxDiscount: c.maxDiscount == null ? null : Number(c.maxDiscount),
      minOrderTotal: Number(c.minOrderTotal),
      productCount: c.productIds.length,
      startsAt: c.startsAt?.toISOString() ?? null,
      endsAt: c.endsAt?.toISOString() ?? null,
      total: c._count.coupons,
      used,
      status: campaignStatus(c, c._count.coupons - used),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Mã giảm giá" subtitle="Mỗi mã chỉ dùng được một lần; tạo theo đợt, hàng loạt" />
      <CouponsManager
        campaigns={rows}
        products={products.map((p) => ({ id: p.id, name: p.name, minPrice: p.minPrice == null ? null : Number(p.minPrice) }))}
      />
    </div>
  );
};

export default CouponsPage;

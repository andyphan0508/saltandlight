import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, type Prisma } from "@saltandlight/db";
import { formatVND } from "@saltandlight/domain";
import { BackLink } from "@/components/admin/BackLink";
import { Pagination } from "@/components/admin/Pagination";
import { CAMPAIGN_STATUS, campaignStatus, describeCouponRule } from "@/helpers/coupon";
import { toCouponRule } from "@/server/coupons";
import { CampaignActions } from "./components/CampaignActions";
import { CopyCodeButton } from "./components/CopyCodeButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "unused", label: "Chưa dùng" },
  { id: "used", label: "Đã dùng" },
] as const;

const formatDateTime = (d: Date) =>
  d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });

const CouponDetailPage = async ({ params, searchParams }: { params: { id: string }; searchParams: { status?: string; page?: string } }) => {
  const filter = FILTERS.find((f) => f.id === searchParams.status) ?? FILTERS[0];
  const page = Math.max(1, Number(searchParams.page) || 1);
  const where: Prisma.CouponWhereInput = {
    campaignId: params.id,
    ...(filter.id === "unused" ? { usedAt: null } : filter.id === "used" ? { usedAt: { not: null } } : {}),
  };

  const campaign = await prisma.couponCampaign.findUnique({ where: { id: params.id } }).catch(() => null);
  if (!campaign) notFound();

  const [total, used, filteredCount, coupons, products] = await Promise.all([
    prisma.coupon.count({ where: { campaignId: params.id } }),
    prisma.coupon.count({ where: { campaignId: params.id, usedAt: { not: null } } }),
    prisma.coupon.count({ where }),
    prisma.coupon.findMany({
      where,
      orderBy: [{ usedAt: { sort: "desc", nulls: "last" } }, { createdAt: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, code: true, usedAt: true, order: { select: { id: true, orderNumber: true } } },
    }),
    campaign.productIds.length
      ? prisma.product.findMany({ where: { id: { in: campaign.productIds } }, select: { name: true }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);

  const rule = toCouponRule(campaign);
  const remaining = total - used;
  const status = CAMPAIGN_STATUS[campaignStatus(rule, remaining)];

  return (
    <div className="space-y-5">
      <BackLink href="/admin/coupons" label="Tất cả đợt mã" />

      <section className="luno-card space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{campaign.name}</h1>
            <p className="mt-1 text-sm font-semibold text-brand-forest">{describeCouponRule(rule, formatVND)}</p>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${status.className}`}>{status.label}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ["Tổng số mã", total],
            ["Đã dùng", used],
            ["Còn lại", remaining],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <div className="text-[11px] text-slate-500">{label}</div>
              <div className="text-xl font-bold tabular-nums text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        <dl className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Áp dụng cho</dt>
            <dd className="font-medium text-slate-800">{products.length ? products.map((p) => p.name).join(", ") : "Cả đơn hàng"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Đơn tối thiểu</dt>
            <dd className="font-medium text-slate-800">{rule.minOrderTotal > 0 ? formatVND(rule.minOrderTotal) : "Không yêu cầu"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Bắt đầu</dt>
            <dd className="font-medium text-slate-800">{campaign.startsAt ? formatDateTime(campaign.startsAt) : "Ngay khi tạo"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Hết hạn</dt>
            <dd className="font-medium text-slate-800">{campaign.endsAt ? formatDateTime(campaign.endsAt) : "Không giới hạn"}</dd>
          </div>
        </dl>

        <CampaignActions campaignId={campaign.id} isActive={campaign.isActive} hasUsedCodes={used > 0} remaining={remaining} />
      </section>

      <section className="luno-card">
        <nav aria-label="Lọc mã" className="flex gap-2 border-b border-slate-100 p-4">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/coupons/${campaign.id}${f.id === "all" ? "" : `?status=${f.id}`}`}
              aria-current={f.id === filter.id ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-xs font-bold sm:py-1.5 ${
                f.id === filter.id ? "bg-ink text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </nav>

        {coupons.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-400">Không có mã nào trong mục này.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {coupons.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
                <div className="flex items-center gap-2">
                  <code className={`font-mono text-sm font-semibold tracking-wide ${c.usedAt ? "text-slate-400 line-through" : "text-slate-900"}`}>{c.code}</code>
                  {!c.usedAt && <CopyCodeButton code={c.code} />}
                </div>
                {c.usedAt ? (
                  <div className="text-xs text-slate-500">
                    Đã dùng {formatDateTime(c.usedAt)}
                    {c.order && (
                      <>
                        {" · "}
                        <Link href={`/admin/orders/${c.order.id}`} className="font-semibold text-brand-forest hover:underline">
                          {c.order.orderNumber}
                        </Link>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700">Chưa dùng</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-slate-100 p-4">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filteredCount}
            basePath={`/admin/coupons/${campaign.id}`}
            searchParams={{ status: filter.id === "all" ? undefined : filter.id }}
          />
        </div>
      </section>
    </div>
  );
};

export default CouponDetailPage;

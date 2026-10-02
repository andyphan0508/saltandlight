"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { Plus, Gift } from "@/components/admin/Icons";
import { CAMPAIGN_STATUS, describeCouponRule, type CampaignStatus, type CouponRule } from "@/helpers/coupon";
import type { PromotionProductOption } from "@/interfaces/promotion";
import { CampaignFormModal } from "./CampaignFormModal";

export interface CampaignRow {
  id: string;
  name: string;
  discountType: CouponRule["discountType"];
  discountValue: number;
  maxDiscount: number | null;
  minOrderTotal: number;
  productCount: number;
  startsAt: string | null;
  endsAt: string | null;
  total: number;
  used: number;
  status: CampaignStatus;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const validity = (c: CampaignRow) =>
  c.startsAt && c.endsAt
    ? `${formatDate(c.startsAt)} – ${formatDate(c.endsAt)}`
    : c.endsAt
      ? `Đến ${formatDate(c.endsAt)}`
      : c.startsAt
        ? `Từ ${formatDate(c.startsAt)}`
        : "Không giới hạn thời gian";

/** Every campaign with what it gives, where it applies, and how many codes are left. */
export const CouponsManager = ({ campaigns, products }: { campaigns: CampaignRow[]; products: PromotionProductOption[] }) => {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-forest px-5 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          <Plus size={16} />
          Tạo đợt mã
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="luno-card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-50 text-brand-forest">
            <Gift size={26} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">Chưa có đợt mã giảm giá nào</p>
          <p className="mt-1 text-xs text-slate-500">Tạo một đợt để sinh hàng loạt mã, mỗi mã khách dùng được một lần.</p>
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {campaigns.map((c) => {
            const remaining = c.total - c.used;
            const status = CAMPAIGN_STATUS[c.status];
            return (
              <li key={c.id}>
                <Link
                  href={`/admin/coupons/${c.id}`}
                  className="luno-card block p-4 transition-transform active:scale-[0.99] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-slate-900">{c.name}</h2>
                      <p className="mt-0.5 text-sm font-semibold text-brand-forest">{describeCouponRule(c, formatVND)}</p>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${status.className}`}>{status.label}</span>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500">
                    <dt className="sr-only">Áp dụng cho</dt>
                    <dd>{c.productCount === 0 ? "Cả đơn hàng" : `${c.productCount} sản phẩm`}</dd>
                    <dt className="sr-only">Đơn tối thiểu</dt>
                    <dd>{c.minOrderTotal > 0 ? `Đơn từ ${formatVND(c.minOrderTotal)}` : "Không yêu cầu đơn tối thiểu"}</dd>
                    <dt className="sr-only">Thời gian</dt>
                    <dd className="col-span-2">{validity(c)}</dd>
                  </dl>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">
                        Đã dùng <b className="text-slate-900">{c.used}</b> / {c.total}
                      </span>
                      <span className="font-bold text-slate-900">Còn {remaining} mã</span>
                    </div>
                    <div
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-label="Số mã đã dùng"
                      aria-valuemin={0}
                      aria-valuemax={c.total}
                      aria-valuenow={c.used}
                    >
                      <div className="h-full rounded-full bg-brand-forest" style={{ width: `${c.total ? (c.used / c.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {isCreating && <CampaignFormModal products={products} onClose={() => setIsCreating(false)} />}
    </div>
  );
};

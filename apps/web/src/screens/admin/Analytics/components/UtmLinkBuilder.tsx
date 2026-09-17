"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SITE_URL } from "@/helpers/site-url";

const PLATFORMS = [
  { id: "facebook", label: "Facebook / Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "google", label: "Google" },
  { id: "zalo", label: "Zalo" },
] as const;

const slugifyCampaign = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/**
 * Builds the link to paste into an ad. The utm tags are what let the
 * dashboard separate an ad click from an organic Facebook visit (fbclid alone
 * can't), and group results by campaign.
 */
export const UtmLinkBuilder = () => {
  const [path, setPath] = useState("/san-pham");
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]["id"]>("facebook");
  const [campaign, setCampaign] = useState("");

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(cleanPath, SITE_URL);
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "paid");
  if (campaign.trim()) url.searchParams.set("utm_campaign", slugifyCampaign(campaign));
  const link = url.toString();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Đã sao chép link quảng cáo");
    } catch {
      toast.error("Không sao chép được — hãy bôi đen và copy thủ công");
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-semibold text-slate-600">
          Trang đích
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/san-pham/ten-san-pham"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-forest focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Nền tảng chạy quảng cáo
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as typeof platform)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-forest focus:outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Tên chiến dịch
          <input
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="VD: Giáng Sinh 15h"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-forest focus:outline-none"
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
        <code className="min-w-0 flex-1 break-all text-xs text-slate-800">{link}</code>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg bg-brand-forest px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
        >
          Sao chép link
        </button>
      </div>
      <p className="text-[11px] text-slate-500">
        Dán link này làm đường dẫn đích của quảng cáo. Mỗi đợt chạy đặt một tên chiến dịch riêng để so sánh hiệu quả trong bảng nguồn truy cập.
      </p>
    </div>
  );
};

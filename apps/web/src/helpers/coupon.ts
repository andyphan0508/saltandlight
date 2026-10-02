/** The rule part of a coupon campaign, as plain numbers. */
export interface CouponRule {
  discountType: "percent" | "fixed" | "free_shipping";
  /** Percent (1–100) for `percent`, VND for `fixed`. */
  discountValue: number;
  maxDiscount: number | null;
  minOrderTotal: number;
  /** Empty = the whole order. */
  productIds: string[];
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
}

export interface CouponCart {
  lines: { productId: string; lineTotal: number }[];
  subtotal: number;
  shippingFee: number;
}

export type CouponRejection = "inactive" | "not_started" | "expired" | "min_order" | "no_eligible_items" | "used" | "not_found";

export type CouponResult = { ok: true; discount: number } | { ok: false; reason: CouponRejection };

/** What the shopper reads for each reason a code doesn't apply. */
export const COUPON_REJECTION_MESSAGES: Record<CouponRejection, string> = {
  not_found: "Mã giảm giá không tồn tại.",
  used: "Mã này đã được sử dụng.",
  inactive: "Mã này hiện đã ngừng áp dụng.",
  not_started: "Mã này chưa đến thời gian áp dụng.",
  expired: "Mã này đã hết hạn.",
  min_order: "Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.",
  no_eligible_items: "Giỏ hàng không có sản phẩm nào được áp dụng mã này.",
};

/** "  sale-abc 12 " → "SALE-ABC12": what the shopper typed, as stored. */
export const normalizeCouponCode = (raw: string) => raw.replace(/\s+/g, "").toUpperCase();

// No 0/O/1/I/L: a code read off a printed card or a screenshot is typed right first time
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const RANDOM_LENGTH = 8;

/** "Tết 2026!" → "TET2026": letters and digits only, at most 10. */
export const sanitizeCouponPrefix = (raw: string) =>
  raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

/**
 * `count` distinct codes like "TET2026-K7QX9MPA". The random part is 8 characters from
 * a 31-letter alphabet (~8.5×10¹¹ combinations) drawn from the CSPRNG, so codes can't be
 * guessed or worked out from one another. Collisions with existing codes are left to the
 * unique index; the caller retries.
 */
export const generateCouponCodes = (count: number, prefix = "", random = (n: number) => crypto.getRandomValues(new Uint8Array(n))) => {
  const head = sanitizeCouponPrefix(prefix);
  const codes = new Set<string>();
  while (codes.size < count) {
    // 248 = 31 × 8: bytes above it are dropped so every letter is equally likely
    const bytes = [...random(RANDOM_LENGTH * 2)].filter((b) => b < 248).slice(0, RANDOM_LENGTH);
    if (bytes.length < RANDOM_LENGTH) continue;
    const body = bytes.map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
    codes.add(head ? `${head}-${body}` : body);
  }
  return [...codes];
};

/**
 * How much a valid code takes off this cart — percent or fixed on the eligible lines
 * (the whole order when the campaign names no products), or the shipping fee — never
 * more than what it applies to. Whether the code itself was already used is the
 * caller's check; this is the campaign's rule.
 */
export const couponDiscount = (rule: CouponRule, cart: CouponCart, now = new Date()): CouponResult => {
  if (!rule.isActive) return { ok: false, reason: "inactive" };
  if (rule.startsAt && now < rule.startsAt) return { ok: false, reason: "not_started" };
  if (rule.endsAt && now > rule.endsAt) return { ok: false, reason: "expired" };
  if (cart.subtotal < rule.minOrderTotal) return { ok: false, reason: "min_order" };

  const eligible =
    rule.productIds.length === 0
      ? cart.subtotal
      : cart.lines.filter((l) => rule.productIds.includes(l.productId)).reduce((sum, l) => sum + l.lineTotal, 0);
  if (eligible <= 0) return { ok: false, reason: "no_eligible_items" };

  if (rule.discountType === "free_shipping") return { ok: true, discount: cart.shippingFee };

  const raw = rule.discountType === "percent" ? Math.round((eligible * rule.discountValue) / 100) : rule.discountValue;
  const capped = rule.discountType === "percent" && rule.maxDiscount != null ? Math.min(raw, rule.maxDiscount) : raw;
  return { ok: true, discount: Math.max(0, Math.min(capped, eligible)) };
};

/** "Giảm 10% (tối đa 50.000 ₫)", "Giảm 30.000 ₫", "Miễn phí vận chuyển" — for admin lists and the cart. */
export const describeCouponRule = (rule: Pick<CouponRule, "discountType" | "discountValue" | "maxDiscount">, formatVnd: (n: number) => string) => {
  if (rule.discountType === "free_shipping") return "Miễn phí vận chuyển";
  if (rule.discountType === "fixed") return `Giảm ${formatVnd(rule.discountValue)}`;
  return `Giảm ${rule.discountValue}%${rule.maxDiscount != null ? ` (tối đa ${formatVnd(rule.maxDiscount)})` : ""}`;
};

export type CampaignStatus = "running" | "paused" | "scheduled" | "expired" | "used_up";

export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; className: string }> = {
  running: { label: "Đang chạy", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  scheduled: { label: "Chưa bắt đầu", className: "bg-sky-50 text-sky-700 ring-sky-600/20" },
  paused: { label: "Tạm dừng", className: "bg-slate-100 text-slate-600 ring-slate-500/20" },
  expired: { label: "Hết hạn", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  used_up: { label: "Hết mã", className: "bg-rose-50 text-rose-700 ring-rose-600/20" },
};

/** One word for where a campaign stands; a paused campaign reads paused whatever its dates. */
export const campaignStatus = (
  campaign: Pick<CouponRule, "isActive" | "startsAt" | "endsAt">,
  remaining: number,
  now = new Date(),
): CampaignStatus => {
  if (!campaign.isActive) return "paused";
  if (campaign.endsAt && now > campaign.endsAt) return "expired";
  if (remaining === 0) return "used_up";
  if (campaign.startsAt && now < campaign.startsAt) return "scheduled";
  return "running";
};

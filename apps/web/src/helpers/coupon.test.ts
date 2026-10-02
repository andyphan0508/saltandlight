import { test } from "node:test";
import assert from "node:assert/strict";
import { campaignStatus, couponDiscount, generateCouponCodes, normalizeCouponCode, sanitizeCouponPrefix, type CouponRule } from "./coupon";

const rule = (patch: Partial<CouponRule> = {}): CouponRule => ({
  discountType: "percent",
  discountValue: 10,
  maxDiscount: null,
  minOrderTotal: 0,
  productIds: [],
  startsAt: null,
  endsAt: null,
  isActive: true,
  ...patch,
});
const cart = {
  lines: [
    { productId: "shirt", lineTotal: 300_000 },
    { productId: "bag", lineTotal: 200_000 },
  ],
  subtotal: 500_000,
  shippingFee: 19_000,
};

test("percent, fixed and free shipping take off the right amount", () => {
  assert.deepEqual(couponDiscount(rule(), cart), { ok: true, discount: 50_000 });
  assert.deepEqual(couponDiscount(rule({ maxDiscount: 30_000 }), cart), { ok: true, discount: 30_000 }, "capped");
  assert.deepEqual(couponDiscount(rule({ discountType: "fixed", discountValue: 40_000 }), cart), { ok: true, discount: 40_000 });
  assert.deepEqual(couponDiscount(rule({ discountType: "free_shipping" }), cart), { ok: true, discount: 19_000 });
});

test("a product-limited code only discounts those products, and never more than they cost", () => {
  assert.deepEqual(couponDiscount(rule({ productIds: ["bag"] }), cart), { ok: true, discount: 20_000 });
  assert.deepEqual(couponDiscount(rule({ productIds: ["bag"], discountType: "fixed", discountValue: 999_000 }), cart), { ok: true, discount: 200_000 });
  assert.deepEqual(couponDiscount(rule({ productIds: ["hat"] }), cart), { ok: false, reason: "no_eligible_items" });
});

test("switched off, too early, too late or under the minimum is refused", () => {
  const now = new Date("2026-10-02T00:00:00Z");
  assert.deepEqual(couponDiscount(rule({ isActive: false }), cart, now), { ok: false, reason: "inactive" });
  assert.deepEqual(couponDiscount(rule({ startsAt: new Date("2026-10-03") }), cart, now), { ok: false, reason: "not_started" });
  assert.deepEqual(couponDiscount(rule({ endsAt: new Date("2026-10-01") }), cart, now), { ok: false, reason: "expired" });
  assert.deepEqual(couponDiscount(rule({ minOrderTotal: 600_000 }), cart, now), { ok: false, reason: "min_order" });
});

test("codes are distinct, prefixed, and avoid look-alike characters", () => {
  const codes = generateCouponCodes(500, "Tết 2026!");
  assert.equal(new Set(codes).size, 500);
  for (const code of codes) assert.match(code, /^TET2026-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/);
  assert.match(generateCouponCodes(1)[0]!, /^[A-Z2-9]{8}$/);
});

test("what the shopper types matches what is stored", () => {
  assert.equal(normalizeCouponCode("  tet2026-k7qx 9mpa "), "TET2026-K7QX9MPA");
  assert.equal(sanitizeCouponPrefix("Đông-ấm"), "DONGAM");
});

test("a campaign reads paused, expired, used up, scheduled or running — in that order of precedence", () => {
  const now = new Date("2026-10-02T00:00:00Z");
  const base = { isActive: true, startsAt: null, endsAt: null };
  assert.equal(campaignStatus({ ...base, isActive: false }, 5, now), "paused");
  assert.equal(campaignStatus({ ...base, endsAt: new Date("2026-10-01") }, 5, now), "expired");
  assert.equal(campaignStatus(base, 0, now), "used_up");
  assert.equal(campaignStatus({ ...base, startsAt: new Date("2026-10-05") }, 5, now), "scheduled");
  assert.equal(campaignStatus(base, 5, now), "running");
});

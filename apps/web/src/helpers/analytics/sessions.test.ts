import { test } from "node:test";
import assert from "node:assert/strict";
import { classifySession, summarizeProducts, summarizeSessions, vietnamDay, vietnamHour, type SessionRow } from "./sessions";

const session = (overrides: Partial<SessionRow>): SessionRow => ({
  sessionId: Math.random().toString(36),
  visitorId: "v1",
  source: "direct",
  campaign: "",
  device: "mobile",
  flags: "",
  landing: "/",
  startedAt: "2026-09-17 08:00:00",
  pageViews: 1,
  totalDurationMs: 5_000,
  maxScroll: 40,
  productViews: 0,
  carts: 0,
  checkouts: 0,
  orders: 0,
  weight: 1,
  ...overrides,
});

test("sessions are sorted into suspect, instant exit, bounce and engaged", () => {
  assert.equal(classifySession(session({ flags: "dc" })), "suspect");
  assert.equal(classifySession(session({ totalDurationMs: 1_200, maxScroll: 0 })), "instant_exit");
  assert.equal(classifySession(session({ totalDurationMs: 6_000 })), "bounce");
  assert.equal(classifySession(session({ pageViews: 3 })), "engaged");
  assert.equal(classifySession(session({ totalDurationMs: 1_000, carts: 1 })), "engaged", "a conversion is engagement however fast");
});

test("15:00 UTC+7 is 08:00 UTC — ad traffic lands in the right hour and day", () => {
  assert.equal(vietnamHour("2026-09-17 08:00:00"), 15);
  assert.equal(vietnamHour("2026-09-17 20:30:00"), 3);
  assert.equal(vietnamDay("2026-09-17 20:30:00"), "2026-09-18");
});

test("the traffic summary separates fake-looking clicks from real bounces", () => {
  const rows = [
    session({ source: "facebook_ads", campaign: "sale-15h", totalDurationMs: 800, maxScroll: 0, visitorId: "a" }),
    session({ source: "facebook_ads", campaign: "sale-15h", totalDurationMs: 900, maxScroll: 5, visitorId: "b" }),
    session({ source: "facebook_ads", campaign: "sale-15h", pageViews: 4, carts: 1, orders: 1, visitorId: "c" }),
    session({ source: "facebook_ads", flags: "bot", visitorId: "d" }),
    session({ source: "direct", totalDurationMs: 20_000, visitorId: "a" }),
  ];
  const s = summarizeSessions(rows);
  assert.equal(s.sessions, 5);
  assert.equal(s.visitors, 4, "visitor a came twice");
  assert.equal(s.suspectRate, 1 / 5);
  assert.equal(s.humanSessions, 4);
  assert.equal(s.instantExitRate, 2 / 4);
  assert.equal(s.bounceRate, 2 / 4);
  assert.equal(s.orderSessions, 1);
  assert.equal(s.byHour[15]!.paid, 4);
  assert.equal(s.byHour[15]!.other, 1);

  const fb = s.sources.find((x) => x.source === "facebook_ads")!;
  assert.equal(fb.sessions, 4);
  assert.equal(fb.suspectRate, 1 / 4);
  assert.equal(fb.instantExitRate, 2 / 3);
  assert.equal(fb.conversionRate, 1 / 3);
  assert.deepEqual(fb.campaigns[0], { campaign: "sale-15h", sessions: 3, instantExitRate: 2 / 3, orderSessions: 1 });
});

test("sampled rows count by their weight", () => {
  const s = summarizeSessions([session({ weight: 10 })]);
  assert.equal(s.sessions, 10);
  assert.equal(s.pageViews, 10);
});

test("a product put in the cart and not bought is an abandoned cart; most abandoned first", () => {
  const products = summarizeProducts([
    { productId: "p1", productName: "Áo A", sessionId: "s1", views: 2, addedQty: 1, adds: 1, boughtQty: 0, weight: 1 },
    { productId: "p1", productName: "Áo A", sessionId: "s2", views: 1, addedQty: 2, adds: 1, boughtQty: 0, weight: 1 },
    { productId: "p2", productName: "Áo B", sessionId: "s1", views: 1, addedQty: 1, adds: 1, boughtQty: 1, weight: 1 },
    { productId: "p2", productName: "Áo B", sessionId: "s3", views: 1, addedQty: 0, adds: 0, boughtQty: 0, weight: 1 },
  ]);
  assert.equal(products[0]!.productId, "p1");
  assert.deepEqual(
    { cart: products[0]!.cartSessions, abandoned: products[0]!.abandonedSessions, rate: products[0]!.abandonRate, qty: products[0]!.addedQty },
    { cart: 2, abandoned: 2, rate: 1, qty: 3 },
  );
  assert.equal(products[1]!.abandonRate, 0);
  assert.equal(products[1]!.viewToCartRate, 1 / 2);
});

test("the session cookie survives a round trip and rejects garbage", async () => {
  const { decodeSessionCookie, encodeSessionCookie } = await import("./beacon");
  const cookie = { sessionId: "abc12345-6789", source: "facebook_ads", campaign: "sale|15h", medium: "paid", referrerHost: "", isNewVisitor: true };
  const decoded = decodeSessionCookie(encodeSessionCookie({ ...cookie, campaign: "sale-15h" }));
  assert.deepEqual(decoded, { ...cookie, campaign: "sale-15h" });
  assert.equal(decodeSessionCookie("nonsense"), null);
  assert.equal(decodeSessionCookie(undefined), null);
});

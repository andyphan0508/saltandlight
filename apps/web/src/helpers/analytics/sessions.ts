import { SOURCE_LABELS, TRAFFIC_SOURCES, type TrafficSource } from "./attribution";

/** One visit as aggregated by the Analytics Engine query (see server/analytics/report.ts). */
export interface SessionRow {
  sessionId: string;
  visitorId: string;
  source: string;
  campaign: string;
  device: string;
  flags: string;
  landing: string;
  startedAt: string;
  pageViews: number;
  /** Visible time summed over the session; page_leave events arrive in increments (tab hidden, then back). */
  totalDurationMs: number;
  maxScroll: number;
  productViews: number;
  carts: number;
  checkouts: number;
  orders: number;
  weight: number;
}

export type SessionQuality = "suspect" | "instant_exit" | "bounce" | "engaged";

export const QUALITY_LABELS: Record<SessionQuality, string> = {
  suspect: "Nghi click ảo / bot",
  instant_exit: "Thoát ngay (< 3 giây)",
  bounce: "Xem 1 trang rồi thoát",
  engaged: "Có tương tác thật",
};

const ENGAGED_MS = 10_000;
const INSTANT_MS = 3_000;

/**
 * Engaged = GA4's definition (2+ pages, 10s+, or a conversion). An instant exit
 * — one page, under 3 seconds, barely scrolled — is what paid clicks from a
 * badly targeted or fraudulent placement look like, so it's kept apart from an
 * ordinary bounce.
 */
export const classifySession = (row: SessionRow): SessionQuality => {
  if (row.flags) return "suspect";
  if (row.carts > 0 || row.orders > 0 || row.pageViews >= 2 || row.totalDurationMs >= ENGAGED_MS) return "engaged";
  if (row.totalDurationMs < INSTANT_MS && row.maxScroll < 25) return "instant_exit";
  return "bounce";
};

/** "2026-09-17 08:05:00" (UTC, as the SQL API returns it) → hour of day in Vietnam (UTC+7). */
export const vietnamHour = (utc: string) => (new Date(`${utc.replace(" ", "T")}Z`).getUTCHours() + 7) % 24;

/** Same timestamp → "YYYY-MM-DD" of the Vietnam calendar day. */
export const vietnamDay = (utc: string) =>
  new Date(new Date(`${utc.replace(" ", "T")}Z`).getTime() + 7 * 3_600_000).toISOString().slice(0, 10);

const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : 0);

export interface SourceSummary {
  source: TrafficSource;
  label: string;
  sessions: number;
  suspectRate: number;
  instantExitRate: number;
  bounceRate: number;
  engagedRate: number;
  avgDurationMs: number;
  cartSessions: number;
  orderSessions: number;
  conversionRate: number;
  campaigns: { campaign: string; sessions: number; instantExitRate: number; orderSessions: number }[];
}

export interface TrafficSummary {
  sessions: number;
  humanSessions: number;
  visitors: number;
  pageViews: number;
  /** Share of real (non-suspect) sessions that left after one page without engaging. */
  bounceRate: number;
  instantExitRate: number;
  suspectRate: number;
  avgDurationMs: number;
  productViewSessions: number;
  cartSessions: number;
  checkoutSessions: number;
  orderSessions: number;
  conversionRate: number;
  quality: Record<SessionQuality, number>;
  byHour: { hour: number; paid: number; other: number }[];
  byDay: { day: string; sessions: number; paid: number }[];
  sources: SourceSummary[];
}

const isPaidSource = (source: string) => source.endsWith("_ads");

/** Every number on the traffic dashboard, from one row per session. Sampled rows count `weight` times. */
export const summarizeSessions = (rows: SessionRow[]): TrafficSummary => {
  const quality: Record<SessionQuality, number> = { suspect: 0, instant_exit: 0, bounce: 0, engaged: 0 };
  const visitors = new Set<string>();
  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, paid: 0, other: 0 }));
  const byDay = new Map<string, { day: string; sessions: number; paid: number }>();
  const bySource = new Map<string, SessionRow[]>();

  let sessions = 0;
  let pageViews = 0;
  let durationSum = 0;
  let productViewSessions = 0;
  let cartSessions = 0;
  let checkoutSessions = 0;
  let orderSessions = 0;

  for (const row of rows) {
    const w = row.weight || 1;
    sessions += w;
    pageViews += row.pageViews * w;
    visitors.add(row.visitorId);
    quality[classifySession(row)] += w;
    if (!row.flags) durationSum += row.totalDurationMs * w;
    if (row.productViews > 0) productViewSessions += w;
    if (row.carts > 0) cartSessions += w;
    if (row.checkouts > 0) checkoutSessions += w;
    if (row.orders > 0) orderSessions += w;

    const hour = byHour[vietnamHour(row.startedAt)]!;
    if (isPaidSource(row.source)) hour.paid += w;
    else hour.other += w;

    const dayKey = vietnamDay(row.startedAt);
    const day = byDay.get(dayKey) ?? { day: dayKey, sessions: 0, paid: 0 };
    day.sessions += w;
    if (isPaidSource(row.source)) day.paid += w;
    byDay.set(dayKey, day);

    bySource.set(row.source, [...(bySource.get(row.source) ?? []), row]);
  }

  const humanSessions = sessions - quality.suspect;

  const sources: SourceSummary[] = [...bySource.entries()]
    .map(([source, list]) => {
      const q: Record<SessionQuality, number> = { suspect: 0, instant_exit: 0, bounce: 0, engaged: 0 };
      let total = 0;
      let duration = 0;
      let carts = 0;
      let orders = 0;
      const campaigns = new Map<string, { campaign: string; sessions: number; instant: number; orderSessions: number }>();
      for (const row of list) {
        const w = row.weight || 1;
        const cls = classifySession(row);
        total += w;
        q[cls] += w;
        if (!row.flags) duration += row.totalDurationMs * w;
        if (row.carts > 0) carts += w;
        if (row.orders > 0) orders += w;
        if (row.campaign) {
          const c = campaigns.get(row.campaign) ?? { campaign: row.campaign, sessions: 0, instant: 0, orderSessions: 0 };
          c.sessions += w;
          if (cls === "instant_exit" || cls === "suspect") c.instant += w;
          if (row.orders > 0) c.orderSessions += w;
          campaigns.set(row.campaign, c);
        }
      }
      const human = total - q.suspect;
      const known = (TRAFFIC_SOURCES as readonly string[]).includes(source) ? (source as TrafficSource) : "referral";
      return {
        source: known,
        label: SOURCE_LABELS[known],
        sessions: total,
        suspectRate: ratio(q.suspect, total),
        instantExitRate: ratio(q.instant_exit, human),
        bounceRate: ratio(q.instant_exit + q.bounce, human),
        engagedRate: ratio(q.engaged, human),
        avgDurationMs: human > 0 ? duration / human : 0,
        cartSessions: carts,
        orderSessions: orders,
        conversionRate: ratio(orders, human),
        campaigns: [...campaigns.values()]
          .sort((a, b) => b.sessions - a.sessions)
          .map((c) => ({ campaign: c.campaign, sessions: c.sessions, instantExitRate: ratio(c.instant, c.sessions), orderSessions: c.orderSessions })),
      };
    })
    .sort((a, b) => b.sessions - a.sessions);

  return {
    sessions,
    humanSessions,
    visitors: visitors.size,
    pageViews,
    bounceRate: ratio(quality.instant_exit + quality.bounce, humanSessions),
    instantExitRate: ratio(quality.instant_exit, humanSessions),
    suspectRate: ratio(quality.suspect, sessions),
    avgDurationMs: humanSessions > 0 ? durationSum / humanSessions : 0,
    productViewSessions,
    cartSessions,
    checkoutSessions,
    orderSessions,
    conversionRate: ratio(orderSessions, humanSessions),
    quality,
    byHour,
    byDay: [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)),
    sources,
  };
};

/** One product × session row from the product query. */
export interface ProductSessionRow {
  productId: string;
  productName: string;
  sessionId: string;
  views: number;
  addedQty: number;
  adds: number;
  boughtQty: number;
  wishlists: number;
  weight: number;
}

export interface ProductFunnel {
  productId: string;
  productName: string;
  /** Every product_view, including repeat opens in the same session. */
  views: number;
  viewSessions: number;
  /** Visible time summed over every view of the product page. */
  viewDurationMs: number;
  /** Times it was saved to the wishlist (hearts un-ticked again aren't subtracted). */
  wishlists: number;
  cartSessions: number;
  purchaseSessions: number;
  /** Sessions that put it in the cart and left without buying it. */
  abandonedSessions: number;
  abandonRate: number;
  addedQty: number;
  boughtQty: number;
  viewToCartRate: number;
}

const emptyFunnel = (productId: string, productName: string): ProductFunnel => ({
  productId,
  productName,
  views: 0,
  viewSessions: 0,
  viewDurationMs: 0,
  wishlists: 0,
  cartSessions: 0,
  purchaseSessions: 0,
  abandonedSessions: 0,
  abandonRate: 0,
  addedQty: 0,
  boughtQty: 0,
  viewToCartRate: 0,
});

/**
 * Per-product view → cart → purchase, with how many carts were abandoned. Most-abandoned first.
 * `catalog` seeds every published product, so ones nobody opened show up with zero views, and
 * its slugs tie `durationsByPath` (visible time per page path) back to the product on that page.
 */
export const summarizeProducts = (
  rows: ProductSessionRow[],
  catalog: { id: string; name: string; slug?: string }[] = [],
  durationsByPath: Record<string, number> = {},
): ProductFunnel[] => {
  const byProduct = new Map<string, ProductFunnel>(
    catalog.map((c) => [c.id, { ...emptyFunnel(c.id, c.name), viewDurationMs: c.slug ? durationsByPath[`/san-pham/${c.slug}`] ?? 0 : 0 }]),
  );
  for (const row of rows) {
    const w = row.weight || 1;
    const p = byProduct.get(row.productId) ?? emptyFunnel(row.productId, row.productName);
    if (row.productName && !p.productName) p.productName = row.productName;
    p.views += row.views * w;
    p.wishlists += row.wishlists * w;
    if (row.views > 0) p.viewSessions += w;
    if (row.adds > 0) p.cartSessions += w;
    if (row.boughtQty > 0) p.purchaseSessions += w;
    if (row.adds > 0 && row.boughtQty === 0) p.abandonedSessions += w;
    p.addedQty += row.addedQty * w;
    p.boughtQty += row.boughtQty * w;
    byProduct.set(row.productId, p);
  }
  return [...byProduct.values()]
    .map((p) => ({ ...p, abandonRate: ratio(p.abandonedSessions, p.cartSessions), viewToCartRate: ratio(p.cartSessions, p.viewSessions) }))
    .sort((a, b) => b.abandonedSessions - a.abandonedSessions || b.cartSessions - a.cartSessions || b.viewSessions - a.viewSessions);
};

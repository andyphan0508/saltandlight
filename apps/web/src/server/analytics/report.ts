import { summarizeProducts, summarizeSessions, type ProductFunnel, type SessionRow, type TrafficSummary } from "@/helpers/analytics/sessions";
import { resolveWindow, toSqlDateTime, type AnalyticsRangeId, type AnalyticsWindow } from "@/helpers/analytics/ranges";
import { invalidateMemoryCache, withMemoryCache } from "@/server/memory-cache";
import { ANALYTICS_DATASET } from "./dataset";
import { getOrderStats, type OrderStats } from "./orders";
import { AnalyticsQueryError, analyticsQueryConfig, runAnalyticsSql } from "./sql";

// Analytics Engine's free read allowance is 10,000 queries a day; a dashboard
// view costs 3, and results are reused for 5 minutes.
const CACHE_SECONDS = 300;
const SESSION_LIMIT = 20_000;

const between = (start: Date, end: Date) =>
  `timestamp >= toDateTime('${toSqlDateTime(start)}') AND timestamp < toDateTime('${toSqlDateTime(end)}')`;

// One row per session. Column positions follow the layout documented in dataset.ts.
// Both branches of if() must share a type: doubleN columns pair with 0.0, counts with 1 / 0.
const sessionsSql = (start: Date, end: Date) => `
SELECT
  blob6 AS sessionId,
  argMin(blob5, timestamp) AS visitorId,
  argMin(blob7, timestamp) AS source,
  argMin(blob8, timestamp) AS campaign,
  argMin(blob10, timestamp) AS device,
  argMax(blob16, timestamp) AS flags,
  argMin(blob2, timestamp) AS landing,
  min(timestamp) AS startedAt,
  sum(if(blob1 = 'page_view', 1, 0)) AS pageViews,
  sum(if(blob1 = 'page_leave', double3, 0.0)) AS totalDurationMs,
  max(if(blob1 = 'page_leave', double4, 0.0)) AS maxScroll,
  sum(if(blob1 = 'product_view', 1, 0)) AS productViews,
  sum(if(blob1 = 'add_to_cart', 1, 0)) AS carts,
  sum(if(blob1 = 'checkout_start', 1, 0)) AS checkouts,
  sum(if(blob1 = 'order_placed', 1, 0)) AS orders,
  max(_sample_interval) AS weight
FROM ${ANALYTICS_DATASET}
WHERE ${between(start, end)}
GROUP BY blob6
LIMIT ${SESSION_LIMIT}`;

// One row per product per session: enough to tell viewed, carted, bought and abandoned apart.
const productsSql = (start: Date, end: Date) => `
SELECT
  blob3 AS productId,
  argMax(blob4, timestamp) AS productName,
  blob6 AS sessionId,
  sum(if(blob1 = 'product_view', 1, 0)) AS views,
  sum(if(blob1 = 'add_to_cart', double1, 0.0)) AS addedQty,
  sum(if(blob1 = 'add_to_cart', 1, 0)) AS adds,
  sum(if(blob1 = 'purchase', double1, 0.0)) AS boughtQty,
  max(_sample_interval) AS weight
FROM ${ANALYTICS_DATASET}
WHERE ${between(start, end)} AND blob3 != '' AND blob16 = ''
GROUP BY blob3, blob6
LIMIT ${SESSION_LIMIT}`;

const toSessionRow = (r: Record<string, unknown>): SessionRow => ({
  sessionId: String(r.sessionId ?? ""),
  visitorId: String(r.visitorId ?? ""),
  source: String(r.source ?? "direct"),
  campaign: String(r.campaign ?? ""),
  device: String(r.device ?? ""),
  flags: String(r.flags ?? ""),
  landing: String(r.landing ?? ""),
  startedAt: String(r.startedAt ?? ""),
  pageViews: Number(r.pageViews ?? 0),
  totalDurationMs: Number(r.totalDurationMs ?? 0),
  maxScroll: Number(r.maxScroll ?? 0),
  productViews: Number(r.productViews ?? 0),
  carts: Number(r.carts ?? 0),
  checkouts: Number(r.checkouts ?? 0),
  orders: Number(r.orders ?? 0),
  weight: Number(r.weight ?? 1) || 1,
});

export type TrafficReport =
  | { status: "unconfigured"; window: AnalyticsWindow; orders: OrderStats; previousOrders: OrderStats }
  | { status: "error"; window: AnalyticsWindow; orders: OrderStats; previousOrders: OrderStats; message: string }
  | {
      status: "ok";
      window: AnalyticsWindow;
      orders: OrderStats;
      previousOrders: OrderStats;
      current: TrafficSummary;
      previous: TrafficSummary;
      products: ProductFunnel[];
      isTruncated: boolean;
      generatedAt: string;
    };

/** Everything the analytics page shows for a range, cached for 5 minutes per range. */
export const getTrafficReport = async (rangeId: AnalyticsRangeId): Promise<TrafficReport> => {
  const key = `analytics-report-${rangeId}`;
  const report = await buildReport(key, rangeId);
  // Don't keep a failure around for 5 minutes — the next reload should retry
  if (report.status === "error") invalidateMemoryCache(key);
  return report;
};

const buildReport = (key: string, rangeId: AnalyticsRangeId): Promise<TrafficReport> =>
  withMemoryCache(key, CACHE_SECONDS, async () => {
    const window = resolveWindow(rangeId);
    const [orders, previousOrders] = await Promise.all([
      getOrderStats(window.start, window.end),
      getOrderStats(window.previousStart, window.previousEnd),
    ]);

    if (!analyticsQueryConfig()) return { status: "unconfigured", window, orders, previousOrders };

    try {
      const [currentRows, previousRows, productRows] = await Promise.all([
        runAnalyticsSql(sessionsSql(window.start, window.end)),
        runAnalyticsSql(sessionsSql(window.previousStart, window.previousEnd)),
        runAnalyticsSql(productsSql(window.start, window.end)),
      ]);
      return {
        status: "ok",
        window,
        orders,
        previousOrders,
        current: summarizeSessions(currentRows.map(toSessionRow)),
        previous: summarizeSessions(previousRows.map(toSessionRow)),
        products: summarizeProducts(
          productRows.map((r) => ({
            productId: String(r.productId ?? ""),
            productName: String(r.productName ?? ""),
            sessionId: String(r.sessionId ?? ""),
            views: Number(r.views ?? 0),
            addedQty: Number(r.addedQty ?? 0),
            adds: Number(r.adds ?? 0),
            boughtQty: Number(r.boughtQty ?? 0),
            weight: Number(r.weight ?? 1) || 1,
          })),
        ),
        isTruncated: currentRows.length >= SESSION_LIMIT,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      const message = err instanceof AnalyticsQueryError ? err.message : "Không truy vấn được Cloudflare Analytics Engine";
      console.error("[analytics] report failed:", err);
      return { status: "error", window, orders, previousOrders, message };
    }
  });

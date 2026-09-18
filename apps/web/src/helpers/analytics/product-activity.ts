import { toSqlDateTime, type AnalyticsWindow } from "./ranges";
import { vietnamDay, vietnamHour } from "./sessions";

/** One hour of product interactions as the Analytics Engine query returns it (hour in UTC). */
export interface ProductActivityRow {
  hour: string;
  views: number;
  carts: number;
  wishlists: number;
}

export interface ProductActivityPoint {
  /** Full label for tooltips and the table: "14:00 – 14:59" or "17/09/2026". */
  label: string;
  /** Short axis label: "14h" or "17/09". */
  tick: string;
  views: number;
  carts: number;
  wishlists: number;
}

/** Every Vietnam calendar day in the window, so days without visits still get a point. */
export const vietnamDaysBetween = (start: Date, end: Date) => {
  const days: string[] = [];
  for (let t = start.getTime(); t < end.getTime(); t += 86_400_000) days.push(vietnamDay(toSqlDateTime(new Date(t))));
  return [...new Set(days)];
};

/**
 * Hourly UTC rows → one point per Vietnam hour (single-day ranges) or per Vietnam day,
 * with empty buckets as zeros. "Today" stops at the current hour rather than drawing
 * the hours still to come as a drop to zero.
 */
export const bucketProductActivity = (rows: ProductActivityRow[], window: AnalyticsWindow): ProductActivityPoint[] => {
  const keyOf = (utc: string) => (window.isSingleDay ? String(vietnamHour(utc)) : vietnamDay(utc));

  const buckets: { key: string; label: string; tick: string }[] = window.isSingleDay
    ? Array.from({ length: window.id === "today" ? vietnamHour(toSqlDateTime(window.end)) + 1 : 24 }, (_, h) => ({
        key: String(h),
        label: `${h}:00 – ${h}:59`,
        tick: `${h}h`,
      }))
    : vietnamDaysBetween(window.start, window.end).map((day) => ({
        key: day,
        label: day.split("-").reverse().join("/"),
        tick: `${day.slice(8)}/${day.slice(5, 7)}`,
      }));

  const totals = new Map<string, { views: number; carts: number; wishlists: number }>();
  for (const row of rows) {
    const key = keyOf(row.hour);
    const t = totals.get(key) ?? { views: 0, carts: 0, wishlists: 0 };
    t.views += row.views;
    t.carts += row.carts;
    t.wishlists += row.wishlists;
    totals.set(key, t);
  }

  return buckets.map((b) => ({ label: b.label, tick: b.tick, views: 0, carts: 0, wishlists: 0, ...totals.get(b.key) }));
};

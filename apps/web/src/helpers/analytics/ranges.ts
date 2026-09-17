export const ANALYTICS_RANGES = [
  { id: "today", label: "Hôm nay" },
  { id: "yesterday", label: "Hôm qua" },
  { id: "7d", label: "7 ngày" },
  { id: "30d", label: "30 ngày" },
] as const;

export type AnalyticsRangeId = (typeof ANALYTICS_RANGES)[number]["id"];

export interface AnalyticsWindow {
  id: AnalyticsRangeId;
  start: Date;
  end: Date;
  /** The equally long window right before, for the "so với kỳ trước" arrows. */
  previousStart: Date;
  previousEnd: Date;
  /** Hourly buckets make sense for a single day; longer ranges chart by day. */
  isSingleDay: boolean;
}

const VN_OFFSET_MS = 7 * 3_600_000;
const DAY_MS = 86_400_000;

export const readRange = (value: unknown): AnalyticsRangeId =>
  ANALYTICS_RANGES.some((r) => r.id === value) ? (value as AnalyticsRangeId) : "7d";

/** Midnight at the start of `now`'s calendar day in Vietnam, as a UTC instant. */
const vietnamMidnight = (now: Date) => new Date(Math.floor((now.getTime() + VN_OFFSET_MS) / DAY_MS) * DAY_MS - VN_OFFSET_MS);

/**
 * Days follow the Vietnam calendar (a "today" that started at 07:00 local
 * time would split an evening ad run across two days). "Today" is compared
 * with the same hours of yesterday, not all of yesterday.
 */
export const resolveWindow = (id: AnalyticsRangeId, now = new Date()): AnalyticsWindow => {
  const midnight = vietnamMidnight(now);
  const spans: Record<AnalyticsRangeId, [Date, Date]> = {
    today: [midnight, now],
    yesterday: [new Date(midnight.getTime() - DAY_MS), midnight],
    "7d": [new Date(midnight.getTime() - 6 * DAY_MS), now],
    "30d": [new Date(midnight.getTime() - 29 * DAY_MS), now],
  };
  const [start, end] = spans[id];
  const length = end.getTime() - start.getTime();
  const previousEnd = id === "today" ? new Date(start.getTime() - DAY_MS + length) : start;
  return {
    id,
    start,
    end,
    previousStart: new Date(start.getTime() - (id === "today" ? DAY_MS : length)),
    previousEnd,
    isSingleDay: id === "today" || id === "yesterday",
  };
};

/** "2026-09-17 08:00:00" — the literal toDateTime() accepts, in UTC. */
export const toSqlDateTime = (date: Date) => date.toISOString().slice(0, 19).replace("T", " ");

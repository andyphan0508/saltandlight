const intFormat = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

export const formatInt = (value: number) => intFormat.format(Math.round(value));

export const formatPercent = (ratio: number, digits = 1) =>
  `${(ratio * 100).toLocaleString("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

export const formatDuration = (ms: number) => {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} giây`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes} phút ${rest} giây` : `${minutes} phút`;
};

export const formatVnd = (value: number) => `${intFormat.format(Math.round(value))} ₫`;

/** Change against the previous period: relative % for counts, percentage points for rates. */
export const describeChange = (current: number, previous: number, kind: "count" | "rate") => {
  if (kind === "rate") {
    const points = (current - previous) * 100;
    return { direction: Math.sign(Math.round(points * 10)), text: `${Math.abs(points).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} điểm %` };
  }
  if (previous === 0) return { direction: current > 0 ? 1 : 0, text: current > 0 ? "mới" : "0%" };
  const pct = ((current - previous) / previous) * 100;
  return { direction: Math.sign(Math.round(pct * 10)), text: `${Math.abs(pct).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%` };
};

const TICK_STEPS = [1, 2, 2.5, 3, 4, 5, 6, 8, 10];

/**
 * Top of a count axis with gridlines at 0 / half / top, where both the half and the top
 * are round whole numbers (0 / 60 / 120, never 0 / 53 / 105). At least 2.
 */
export const niceAxisMax = (value: number) => {
  const half = Math.max(value, 2) / 2;
  const power = 10 ** Math.floor(Math.log10(half));
  const step = TICK_STEPS.find((s) => s * power >= half && Number.isInteger(s * power)) ?? 10;
  return step * power * 2;
};

/** "1p 8s" / "45s": short enough for a stat tile on a phone. */
export const formatDurationShort = (ms: number) => {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}p ${seconds % 60}s`;
};

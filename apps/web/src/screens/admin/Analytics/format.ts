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

import type { SourceSummary } from "./sessions";

export type VerdictLevel = "good" | "warning" | "critical" | "insufficient";

export interface AdsVerdict {
  level: VerdictLevel;
  source: SourceSummary | null;
  /** Share of the source's sessions that were bots or left within 3 seconds. */
  wasteRate: number;
  message: string;
}

// Below this many sessions a percentage swings on a handful of visits
const MIN_SESSIONS = 20;

/**
 * Reads the paid sources for the tell-tale shape of misdelivered or fake ad
 * clicks: lots of sessions that are bots / datacenters or leave within three
 * seconds without scrolling. Thresholds are deliberately round — a prompt to
 * look at the ad set, not an accusation.
 */
export const judgeAdsTraffic = (sources: SourceSummary[]): AdsVerdict => {
  const paid = sources.filter((s) => s.source.endsWith("_ads")).sort((a, b) => b.sessions - a.sessions);
  const source = paid[0] ?? null;
  if (!source) {
    return {
      level: "insufficient",
      source: null,
      wasteRate: 0,
      message: "Chưa có lượt truy cập nào từ quảng cáo. Gắn link quảng cáo bằng công cụ tạo link bên dưới để hệ thống nhận ra.",
    };
  }

  const human = 1 - source.suspectRate;
  const wasteRate = source.suspectRate + human * source.instantExitRate;
  if (source.sessions < MIN_SESSIONS) {
    return {
      level: "insufficient",
      source,
      wasteRate,
      message: `${source.label} mới có ${Math.round(source.sessions)} phiên — cần ít nhất ${MIN_SESSIONS} phiên để đánh giá chất lượng.`,
    };
  }

  const percent = `${Math.round(wasteRate * 100)}%`;
  if (wasteRate >= 0.5) {
    return {
      level: "critical",
      source,
      wasteRate,
      message: `${percent} lượt từ ${source.label} là bot hoặc thoát ngay dưới 3 giây. Rất có thể quảng cáo đang phân phối sai tệp hoặc bị click ảo — nên kiểm tra lại vị trí hiển thị (Audience Network) và đối tượng.`,
    };
  }
  if (wasteRate >= 0.3) {
    return {
      level: "warning",
      source,
      wasteRate,
      message: `${percent} lượt từ ${source.label} thoát ngay hoặc là bot — cao hơn mức bình thường, nên theo dõi thêm.`,
    };
  }
  return {
    level: "good",
    source,
    wasteRate,
    message: `Chỉ ${percent} lượt từ ${source.label} là bot hoặc thoát ngay — khách từ quảng cáo đang xem thật.`,
  };
};

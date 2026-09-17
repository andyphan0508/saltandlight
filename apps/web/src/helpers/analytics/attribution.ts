/**
 * Where a visit came from, how it was browsed, and whether it looks automated.
 * Pure functions: the browser uses them when a session starts, the server when
 * it enriches events, and the tests pin the rules down.
 */

export const TRAFFIC_SOURCES = [
  "facebook_ads",
  "facebook",
  "instagram",
  "tiktok_ads",
  "tiktok",
  "google_ads",
  "google",
  "zalo",
  "youtube",
  "other_ads",
  "referral",
  "direct",
] as const;
export type TrafficSource = (typeof TRAFFIC_SOURCES)[number];

export const SOURCE_LABELS: Record<TrafficSource, string> = {
  facebook_ads: "Facebook Ads",
  facebook: "Facebook (tự nhiên)",
  instagram: "Instagram",
  tiktok_ads: "TikTok Ads",
  tiktok: "TikTok",
  google_ads: "Google Ads",
  google: "Google tìm kiếm",
  zalo: "Zalo",
  youtube: "YouTube",
  other_ads: "Quảng cáo khác",
  referral: "Trang web khác",
  direct: "Truy cập trực tiếp",
};

export interface Attribution {
  source: TrafficSource;
  campaign: string;
  medium: string;
}

const PAID_MEDIUM = /^(cpc|ppc|paid|paid[_-]?social|ads?|cpm|display|sponsored|boost(ed)?)$/;

const hostMatches = (host: string, domains: string[]) =>
  domains.some((domain) => host === domain || host.endsWith(`.${domain}`));

const sourceFromName = (name: string, isPaid: boolean): TrafficSource | null => {
  if (/^(facebook|fb|meta)/.test(name)) return isPaid ? "facebook_ads" : "facebook";
  if (/^(instagram|ig)/.test(name)) return isPaid ? "facebook_ads" : "instagram";
  if (/^tiktok/.test(name)) return isPaid ? "tiktok_ads" : "tiktok";
  if (/^(google|adwords)/.test(name)) return isPaid ? "google_ads" : "google";
  if (/^zalo/.test(name)) return "zalo";
  if (/^(youtube|yt)/.test(name)) return "youtube";
  return null;
};

/**
 * Tags win over click ids, click ids over the referrer. `fbclid` alone is not
 * proof of an ad: Facebook appends it to every outbound link, organic posts
 * included — an ad is recognised by its UTM medium (utm_medium=paid/cpc/ads).
 * Facebook's in-app browser usually sends no referrer, so its user agent is
 * the last clue before falling back to "direct".
 */
export const classifySource = (input: {
  search: string;
  referrer: string;
  siteHost: string;
  userAgent: string;
}): Attribution => {
  const params = new URLSearchParams(input.search);
  const utmSource = (params.get("utm_source") ?? "").trim().toLowerCase();
  const medium = (params.get("utm_medium") ?? "").trim().toLowerCase();
  const campaign = (params.get("utm_campaign") ?? "").trim().slice(0, 80);
  const isPaid = PAID_MEDIUM.test(medium);

  if (utmSource) {
    const named = sourceFromName(utmSource, isPaid);
    return { source: named ?? (isPaid ? "other_ads" : "referral"), campaign, medium };
  }
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) return { source: "google_ads", campaign, medium: "cpc" };
  if (params.has("ttclid")) return { source: "tiktok_ads", campaign, medium: "cpc" };

  let referrerHost = "";
  try {
    referrerHost = input.referrer ? new URL(input.referrer).hostname.toLowerCase() : "";
  } catch {
    referrerHost = "";
  }
  const isExternal = referrerHost && referrerHost !== input.siteHost.toLowerCase();

  if (params.has("fbclid") || (isExternal && hostMatches(referrerHost, ["facebook.com", "fb.com", "fb.me", "messenger.com"]))) {
    return { source: "facebook", campaign, medium };
  }
  if (isExternal) {
    if (hostMatches(referrerHost, ["instagram.com"])) return { source: "instagram", campaign, medium };
    if (hostMatches(referrerHost, ["tiktok.com"])) return { source: "tiktok", campaign, medium };
    if (/(^|\.)google\.[a-z.]+$/.test(referrerHost)) return { source: "google", campaign, medium };
    if (hostMatches(referrerHost, ["zalo.me", "zaloapp.com", "zalo.vn"])) return { source: "zalo", campaign, medium };
    if (hostMatches(referrerHost, ["youtube.com", "youtu.be"])) return { source: "youtube", campaign, medium };
    return { source: "referral", campaign, medium };
  }

  const ua = input.userAgent;
  if (/FBAN|FBAV|FB_IAB|FBIOS/.test(ua)) return { source: "facebook", campaign, medium };
  if (/Instagram/.test(ua)) return { source: "instagram", campaign, medium };
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return { source: "tiktok", campaign, medium };
  if (/Zalo/i.test(ua)) return { source: "zalo", campaign, medium };
  return { source: "direct", campaign, medium };
};

export type Device = "mobile" | "tablet" | "desktop";

export const classifyDevice = (userAgent: string): Device => {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(userAgent)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone|Opera Mini/i.test(userAgent)) return "mobile";
  return "desktop";
};

// Crawlers and link-preview fetchers — facebookexternalhit is the one that
// "clicks" every ad link when the ad is created or shared.
const BOT_UA =
  /bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|selenium|lighthouse|facebookexternalhit|facebookcatalog|meta-externalagent|preview|python|curl|wget|axios|node-fetch|go-http|java\/|okhttp|scrapy|httpclient/i;

// Cloud / hosting networks: real shoppers browse from home or mobile ISPs, not from these
const DATACENTER_ORG =
  /amazon|aws|google cloud|google llc|microsoft|azure|digitalocean|ovh|hetzner|linode|akamai|alibaba|tencent|oracle|vultr|contabo|m247|leaseweb|choopa|datacamp|hostinger|scaleway|cdn77|zenlayer|psychz|quadranet|colocrossing|servers\.com|kamatera|ionos|hostwinds|tefincom|packethub|clouvider/i;

export type TrafficFlag = "bot" | "auto" | "dc";

/** Signals that a visit is not a real shopper. Empty for a normal visit. */
export const trafficFlags = (input: { userAgent: string; isAutomated: boolean; asOrganization: string }): TrafficFlag[] => {
  const flags: TrafficFlag[] = [];
  if (!input.userAgent || BOT_UA.test(input.userAgent)) flags.push("bot");
  if (input.isAutomated) flags.push("auto");
  if (input.asOrganization && DATACENTER_ORG.test(input.asOrganization)) flags.push("dc");
  return flags;
};

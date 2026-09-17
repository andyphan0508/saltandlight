import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ClientEventName, ServerEventName } from "@/helpers/analytics/beacon";

declare global {
  interface CloudflareEnv {
    /** Workers Analytics Engine dataset bound in wrangler.jsonc. */
    ANALYTICS?: { writeDataPoint(point: { indexes?: string[]; blobs?: string[]; doubles?: number[] }): void };
  }
}

/** Dataset name as it appears in SQL queries — must match wrangler.jsonc. */
export const ANALYTICS_DATASET = "saltandlight_events";

/**
 * Column layout of every data point. Analytics Engine columns are positional
 * (blob1…, double1…), so this is the one place that names them; the SQL in
 * report.ts reads the same positions.
 *
 * blob1 event · blob2 path · blob3 productId · blob4 productName · blob5 visitorId ·
 * blob6 sessionId · blob7 source · blob8 campaign · blob9 referrerHost · blob10 device ·
 * blob11 country · blob12 city · blob13 network (AS organisation) · blob14 variant ·
 * blob15 medium · blob16 flags ("bot,dc,…")
 * double1 quantity · double2 amount (VND) · double3 durationMs · double4 scroll % ·
 * double5 ASN · double6 isNewVisitor
 */
export interface AnalyticsVisit {
  visitorId: string;
  sessionId: string;
  source: string;
  campaign: string;
  medium: string;
  referrerHost: string;
  isNewVisitor: boolean;
  device: string;
  flags: string[];
}

export interface AnalyticsEvent {
  name: ClientEventName | ServerEventName;
  path: string;
  productId?: string;
  productName?: string;
  variant?: string;
  quantity?: number;
  amount?: number;
  durationMs?: number;
  scroll?: number;
}

export interface RequestNetwork {
  country: string;
  city: string;
  asOrganization: string;
  asn: number;
}

/** Cloudflare's per-request geo / network data; empty outside a Worker (local dev, build). */
export const requestNetwork = (): RequestNetwork => {
  try {
    const cf = (getCloudflareContext().cf ?? {}) as Record<string, unknown>;
    return {
      country: String(cf.country ?? ""),
      city: String(cf.city ?? ""),
      asOrganization: String(cf.asOrganization ?? ""),
      asn: Number(cf.asn ?? 0),
    };
  } catch {
    return { country: "", city: "", asOrganization: "", asn: 0 };
  }
};

const clip = (value: string | undefined, max: number) => (value ?? "").slice(0, max);

/**
 * Writes events to Analytics Engine. writeDataPoint is fire-and-forget and
 * costs no database query. Returns false when the binding isn't there
 * (local dev) so callers can stay oblivious.
 */
export const writeAnalyticsEvents = (visit: AnalyticsVisit, events: AnalyticsEvent[], network: RequestNetwork): boolean => {
  let dataset: CloudflareEnv["ANALYTICS"];
  try {
    dataset = getCloudflareContext().env.ANALYTICS;
  } catch {
    return false;
  }
  if (!dataset) return false;

  for (const event of events) {
    dataset.writeDataPoint({
      // The sampling key: if Cloudflare ever samples, whole sessions are kept or dropped together
      indexes: [visit.sessionId],
      blobs: [
        event.name,
        clip(event.path, 200),
        clip(event.productId, 40),
        clip(event.productName, 120),
        visit.visitorId,
        visit.sessionId,
        visit.source,
        clip(visit.campaign, 80),
        clip(visit.referrerHost, 100),
        visit.device,
        network.country,
        clip(network.city, 60),
        clip(network.asOrganization, 80),
        clip(event.variant, 60),
        clip(visit.medium, 40),
        visit.flags.join(","),
      ],
      doubles: [
        event.quantity ?? 0,
        event.amount ?? 0,
        event.durationMs ?? 0,
        event.scroll ?? 0,
        network.asn,
        visit.isNewVisitor ? 1 : 0,
      ],
    });
  }
  return true;
};

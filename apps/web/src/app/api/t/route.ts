import { NextRequest } from "next/server";
import { beaconSchema } from "@/helpers/analytics/beacon";
import { classifyDevice, trafficFlags } from "@/helpers/analytics/attribution";
import { requestNetwork, writeAnalyticsEvents } from "@/server/analytics/dataset";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_000;
const NO_CONTENT = () => new Response(null, { status: 204 });

/**
 * Analytics beacon. Always answers 204 — a tracking hiccup must never surface
 * to shoppers — and writes to Workers Analytics Engine, never to Postgres.
 * The bot / automation / datacenter flags are decided here from the request
 * itself, not trusted from the browser.
 */
export const POST = async (req: NextRequest) => {
  try {
    const text = await req.text();
    if (!text || text.length > MAX_BODY_BYTES) return NO_CONTENT();
    const parsed = beaconSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return NO_CONTENT();

    const beacon = parsed.data;
    const userAgent = req.headers.get("user-agent") ?? "";
    const network = requestNetwork();

    writeAnalyticsEvents(
      {
        visitorId: beacon.visitorId,
        sessionId: beacon.sessionId,
        source: beacon.source,
        campaign: beacon.campaign,
        medium: beacon.medium,
        referrerHost: beacon.referrerHost,
        isNewVisitor: beacon.isNewVisitor,
        device: classifyDevice(userAgent),
        flags: trafficFlags({ userAgent, isAutomated: beacon.isAutomated, asOrganization: network.asOrganization }),
      },
      beacon.events,
      network,
    );
  } catch {
    // Malformed JSON or a write failure: drop the batch silently
  }
  return NO_CONTENT();
};

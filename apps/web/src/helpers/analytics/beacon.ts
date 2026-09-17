import { z } from "zod";
import { TRAFFIC_SOURCES } from "./attribution";

/** Events the browser may send. Purchases are written by the order API itself, so ad blockers can't hide sales. */
export const CLIENT_EVENTS = ["page_view", "page_leave", "product_view", "add_to_cart", "checkout_start"] as const;
export type ClientEventName = (typeof CLIENT_EVENTS)[number];
export type ServerEventName = "order_placed" | "purchase";

const id = z.string().regex(/^[A-Za-z0-9-]{8,40}$/);

export const analyticsEventSchema = z.object({
  name: z.enum(CLIENT_EVENTS),
  path: z.string().max(200),
  productId: z.string().max(40).optional(),
  productName: z.string().max(120).optional(),
  variant: z.string().max(60).optional(),
  quantity: z.number().int().min(0).max(100).optional(),
  amount: z.number().min(0).max(1_000_000_000).optional(),
  durationMs: z.number().min(0).max(3_600_000).optional(),
  scroll: z.number().min(0).max(100).optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

/** One sendBeacon batch: who is browsing, where they came from, and what they did since the last batch. */
export const beaconSchema = z.object({
  visitorId: id,
  sessionId: id,
  isNewVisitor: z.boolean(),
  isAutomated: z.boolean(),
  source: z.enum(TRAFFIC_SOURCES),
  campaign: z.string().max(80),
  medium: z.string().max(40),
  referrerHost: z.string().max(100),
  events: z.array(analyticsEventSchema).min(1).max(30),
});

export type BeaconPayload = z.infer<typeof beaconSchema>;

/** Cookie names shared by the browser tracker and the order API. */
export const VISITOR_COOKIE = "sl_vid";
export const SESSION_COOKIE = "sl_ses";
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export interface SessionCookie {
  sessionId: string;
  source: string;
  campaign: string;
  medium: string;
  referrerHost: string;
  isNewVisitor: boolean;
}

export const encodeSessionCookie = (s: SessionCookie) =>
  encodeURIComponent([s.sessionId, s.source, s.campaign, s.medium, s.referrerHost, s.isNewVisitor ? "1" : "0"].join("|"));

export const decodeSessionCookie = (raw: string | undefined | null): SessionCookie | null => {
  if (!raw) return null;
  const [sessionId, source, campaign = "", medium = "", referrerHost = "", isNew = "0"] = decodeURIComponent(raw).split("|");
  if (!sessionId || !source || !id.safeParse(sessionId).success) return null;
  return { sessionId, source, campaign, medium, referrerHost, isNewVisitor: isNew === "1" };
};

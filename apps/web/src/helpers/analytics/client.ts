import { classifySource } from "./attribution";
import {
  SESSION_COOKIE,
  SESSION_TIMEOUT_MS,
  VISITOR_COOKIE,
  decodeSessionCookie,
  encodeSessionCookie,
  type AnalyticsEventInput,
  type ClientEventName,
  type SessionCookie,
} from "./beacon";

/**
 * Browser side of the tracker: anonymous visitor / session cookies, source
 * attribution when a session starts, and a queue flushed with sendBeacon.
 * No names, phones or IPs are stored — the visitor id is a random UUID.
 */

const ENDPOINT = "/api/t";
const VISITOR_MAX_AGE_S = 400 * 24 * 3600;
const CAMPAIGN_PARAMS = /[?&](utm_source|utm_medium|utm_campaign|fbclid|gclid|ttclid)=/;

const queue: AnalyticsEventInput[] = [];

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);

const writeCookie = (name: string, value: string, maxAgeSeconds: number) => {
  document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
};

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

/** Admin, the Live Editor preview and other embeds are not shoppers. */
export const isTrackingDisabled = () =>
  typeof window === "undefined" ||
  location.pathname.startsWith("/admin") ||
  new URLSearchParams(location.search).get("editor") === "1" ||
  window.self !== window.top;

interface Visit extends SessionCookie {
  visitorId: string;
}

/**
 * Current visit, starting a session when there is none, the last one timed out,
 * or the visitor just arrived through a different campaign link — so a click on
 * a 15:00 ad counts toward that ad even if they browsed earlier today.
 */
const currentVisit = (): Visit => {
  let visitorId = readCookie(VISITOR_COOKIE);
  const isNewVisitor = !visitorId;
  if (!visitorId) visitorId = newId();
  writeCookie(VISITOR_COOKIE, visitorId, VISITOR_MAX_AGE_S);

  let session = decodeSessionCookie(readCookie(SESSION_COOKIE));
  const hasCampaign = CAMPAIGN_PARAMS.test(location.search);
  const attribution =
    !session || hasCampaign
      ? classifySource({ search: location.search, referrer: document.referrer, siteHost: location.hostname, userAgent: navigator.userAgent })
      : null;

  if (!session || (attribution && (attribution.source !== session.source || attribution.campaign !== session.campaign))) {
    let referrerHost = "";
    try {
      referrerHost = document.referrer ? new URL(document.referrer).hostname : "";
    } catch {
      referrerHost = "";
    }
    session = {
      sessionId: newId(),
      source: attribution!.source,
      campaign: attribution!.campaign,
      medium: attribution!.medium,
      referrerHost: referrerHost === location.hostname ? "" : referrerHost,
      isNewVisitor,
    };
  }

  // Sliding 30-minute session window
  writeCookie(SESSION_COOKIE, encodeSessionCookie(session), SESSION_TIMEOUT_MS / 1000);
  return { ...session, visitorId };
};

export const track = (name: ClientEventName, props: Omit<AnalyticsEventInput, "name" | "path"> & { path?: string } = {}) => {
  if (isTrackingDisabled()) return;
  queue.push({ name, path: props.path ?? location.pathname, ...props });
  if (queue.length >= 25) flush();
};

/** Sends everything queued in one request; sendBeacon survives the page closing. */
export const flush = () => {
  if (isTrackingDisabled() || queue.length === 0) return;
  const visit = currentVisit();
  const body = JSON.stringify({
    visitorId: visit.visitorId,
    sessionId: visit.sessionId,
    isNewVisitor: visit.isNewVisitor,
    isAutomated: navigator.webdriver === true,
    source: visit.source,
    campaign: visit.campaign,
    medium: visit.medium,
    referrerHost: visit.referrerHost,
    events: queue.splice(0, 30),
  });
  const isQueued = typeof navigator.sendBeacon === "function" && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }));
  if (!isQueued) fetch(ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => undefined);
};

import type { NextRequest } from "next/server";
import { classifyDevice, trafficFlags } from "@/helpers/analytics/attribution";
import { SESSION_COOKIE, VISITOR_COOKIE, decodeSessionCookie } from "@/helpers/analytics/beacon";
import { requestNetwork, writeAnalyticsEvents } from "./dataset";

interface OrderLine {
  productId: string;
  productName: string;
  variant: string;
  quantity: number;
  amount: number;
}

/**
 * Written by the order API, not the browser, so a sale is recorded even when an
 * ad blocker swallowed the page beacons. It joins the buyer's session through
 * the tracker's cookies; without them (tracking blocked or cookies cleared)
 * there is no session to attribute to, and the order still counts in the
 * database-backed order figures.
 */
export const recordOrderAnalytics = (req: NextRequest, order: { total: number; items: OrderLine[] }) => {
  try {
    const visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
    const session = decodeSessionCookie(req.cookies.get(SESSION_COOKIE)?.value);
    if (!visitorId || !session) return;

    const userAgent = req.headers.get("user-agent") ?? "";
    const network = requestNetwork();
    writeAnalyticsEvents(
      {
        visitorId,
        sessionId: session.sessionId,
        source: session.source,
        campaign: session.campaign,
        medium: session.medium,
        referrerHost: session.referrerHost,
        isNewVisitor: session.isNewVisitor,
        device: classifyDevice(userAgent),
        flags: trafficFlags({ userAgent, isAutomated: false, asOrganization: network.asOrganization }),
      },
      [
        {
          name: "order_placed",
          path: "/thanh-toan",
          quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          amount: order.total,
        },
        ...order.items.map((item) => ({ name: "purchase" as const, path: "/thanh-toan", ...item })),
      ],
      network,
    );
  } catch {
    // Analytics must never fail an order
  }
};

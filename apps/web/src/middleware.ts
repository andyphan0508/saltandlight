import { NextRequest, NextResponse } from "next/server";
import { getRateLimiter, getClientIp } from "@/lib/rate-limit";

export const config = {
  matcher: ["/api/:path*"],
};

/**
 * Per-route [max requests, window in seconds]. Order creation and the contact
 * form are the most expensive/abuse-prone (DB writes + outbound email, and in
 * the order case, decrementing real stock) so they get the tightest limits.
 * Anything not listed falls back to DEFAULT_RULE.
 */
const RULES: Record<string, [number, number]> = {
  "/api/orders": [5, 600],
  "/api/contact": [5, 600],
  "/api/orders/track": [20, 60],
  "/api/search": [30, 60],
  "/api/cart/quote": [30, 60],
  "/api/products": [30, 60],
  "/api/health": [300, 60],
};

const DEFAULT_RULE: [number, number] = [60, 60];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const [max, windowSeconds] = RULES[path] ?? DEFAULT_RULE;
  const limiter = getRateLimiter(path, max, windowSeconds);
  const ip = getClientIp(req);

  const result = await limiter.limit(ip);

  if (!result.success) {
    return NextResponse.json(
      { error: "Bạn đang thao tác quá nhanh, vui lòng thử lại sau ít phút." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(result.resetMs / 1000).toString(),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(result.limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  return res;
}

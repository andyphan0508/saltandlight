import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRateLimiter, getClientIp } from "@/lib/rate-limit";

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/api/:path*",
    "/auth/:path*",
  ],
};

const RULES: Record<string, [number, number]> = {
  "/api/orders": [5, 600],
  "/api/contact": [5, 600],
  "/api/orders/track": [20, 60],
  "/api/search": [30, 60],
  "/api/cart/quote": [30, 60],
  "/api/products": [30, 60],
  // Static vendored dataset, 30-day CDN cache — generous limit is safe.
  "/api/locations": [60, 60],
  // Public diagnostic endpoint — only an external uptime monitor should be
  // hitting this, so it doesn't need the generous limit a real API does.
  "/api/health": [30, 60],
  // Uploads cost storage + bandwidth, so they get a tighter cap than the
  // general admin DEFAULT_RULE below.
  "/api/admin/media/upload": [10, 60],
  // One-time OAuth redirect per real login — no legitimate user hits this
  // more than a couple times a minute.
  "/auth/callback": [10, 60],
};

const DEFAULT_RULE: [number, number] = [60, 60];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Handle Admin Authentication & Protection
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    let response = NextResponse.next({ request: { headers: req.headers } });
    let user: { id: string } | null = null;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
      }

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: { headers: req.headers } });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;
    } catch (err) {
      // Fail CLOSED for auth: a misconfigured/unreachable Supabase must
      // never leave admin routes open. This previously surfaced as an
      // uncaught exception crashing the whole Worker (Cloudflare's generic
      // "error code: 1101") for every /admin request on the isolate —
      // now it's just treated as "not logged in".
      console.error("[middleware] Supabase auth check failed:", err);
      user = null;
    }

    const isLogin = path === "/admin/login" || path.startsWith("/admin/login/");
    const isApi = path.startsWith("/api/admin");

    // Admin API routes were falling through this block's early returns and
    // never reaching the rate-limiter below — rate-limit them here instead,
    // before the Supabase round-trip, so a 429 doesn't cost an auth check.
    if (isApi) {
      try {
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
            }
          );
        }
      } catch (err) {
        // Fail OPEN for rate-limiting, same as the storefront limiter below.
        console.error("[middleware] Admin rate limiter failed, allowing request through:", err);
      }
    }

    // Redirect root /admin to /admin/dashboard
    if (path === "/admin" || path === "/admin/") {
      if (!user) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Protect non-login admin pages and APIs
    if (!user && !isLogin) {
      if (isApi) {
        return NextResponse.json(
          { error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn" },
          { status: 401 }
        );
      }
      const redirectUrl = new URL("/admin/login", req.url);
      redirectUrl.searchParams.set("next", req.nextUrl.pathname);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }

    // If authenticated user visits login, redirect to dashboard
    if (user && isLogin) {
      if (
        req.nextUrl.searchParams.has("unauthorized") ||
        req.nextUrl.searchParams.has("logout")
      ) {
        return response;
      }
      const redirectResponse = NextResponse.redirect(new URL("/admin/dashboard", req.url));
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }

    return response;
  }

  // 2. Handle Storefront API + Auth Callback Rate-Limiting
  if (path.startsWith("/api/") || path.startsWith("/auth/")) {
    try {
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
          }
        );
      }

      const res = NextResponse.next();
      res.headers.set("X-RateLimit-Limit", String(result.limit));
      res.headers.set("X-RateLimit-Remaining", String(result.remaining));
      return res;
    } catch (err) {
      // Fail OPEN for rate-limiting: an infra hiccup in the limiter itself
      // (e.g. a network error reaching Upstash) must never take down real
      // traffic — worst case we're briefly unthrottled, not offline.
      console.error("[middleware] Rate limiter failed, allowing request through:", err);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

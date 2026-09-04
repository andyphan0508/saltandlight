import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRateLimiter, getClientIp } from "@/lib/rate-limit";

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/api/:path*",
  ],
};

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

  // 1. Handle Admin Authentication & Protection
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    let response = NextResponse.next({ request: { headers: req.headers } });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isLogin = path === "/admin/login" || path.startsWith("/admin/login/");
    const isApi = path.startsWith("/api/admin");

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

  // 2. Handle Storefront API Rate-Limiting
  if (path.startsWith("/api/")) {
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
  }

  return NextResponse.next();
}

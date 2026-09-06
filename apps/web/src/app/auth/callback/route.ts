import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedCustomer } from "@/lib/customer/auth";

export const dynamic = "force-dynamic";

/** Supabase OAuth (Google/Facebook) redirects here with `?code=...` after the provider login. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || "/tai-khoan";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        // Link/create the Customer row now so it's ready the moment the FE lands on `next`.
        await getAuthenticatedCustomer();
      } catch (err) {
        console.error("[auth/callback] customer linking failed:", err);
      }
      return NextResponse.redirect(new URL(next, req.url));
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
  }

  return NextResponse.redirect(new URL("/dang-nhap?error=auth", req.url));
}

import { cache } from "react";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { createSupabaseServerClient } from "@/server/supabase-server";
import { findScriptUrl } from "@/helpers/script-url";

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Shared catch-block handler for admin API routes: auth errors keep their
 * status/message, zod errors become the first validation message, anything
 * else is logged and collapsed to a generic 500. Routes that return
 * `err.flatten()` for structured per-field errors keep that shape instead —
 * this is only for routes that already returned a single error string.
 */
export const apiError = (err: unknown, fallbackMessage = "Có lỗi xảy ra") => {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof z.ZodError) {
    return NextResponse.json(
      { error: err.errors[0]?.message || "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }
  console.error(fallbackMessage, err);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
};

const ADMIN_SELECT = {
  id: true,
  authUserId: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

/**
 * Memoized per request: queries Supabase auth and admin_users once per HTTP request
 * even when called across layout, page, and child components.
 *
 * Shoppers sign in through the same Supabase project, so a Supabase user is NOT an
 * admin. Only an admin_users row created by an owner (or scripts/bootstrap-owner)
 * grants access; nothing here ever creates or reactivates one.
 */
const getAuthenticatedAdmin = cache(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = await prisma.adminUser.findUnique({ where: { authUserId: user.id }, select: ADMIN_SELECT });
  if (admin || !user.email || !user.email_confirmed_at) return admin;

  // An owner invited this email before its Supabase account existed: link it once.
  // Only an unlinked row, and isActive is left as the owner set it.
  const invited = await prisma.adminUser.findUnique({ where: { email: user.email }, select: { id: true, authUserId: true } });
  if (!invited || invited.authUserId) return null;
  return prisma.adminUser.update({ where: { id: invited.id }, data: { authUserId: user.id }, select: ADMIN_SELECT });
});

/**
 * Verifies the Supabase session AND that the linked admin_users row is
 * active — a Supabase user alone isn't enough, since staff accounts are
 * only ever created by inviting through this app (no public sign-up).
 */
export const requireAdmin = async (allowedRoles?: ("owner" | "staff")[]) => {
  const adminUser = await getAuthenticatedAdmin();

  if (!adminUser) throw new AuthError(401, "Chưa đăng nhập");

  if (!adminUser.isActive) {
    throw new AuthError(403, "Tài khoản không có quyền truy cập");
  }

  if (allowedRoles && !allowedRoles.includes(adminUser.role)) {
    throw new AuthError(403, "Không đủ quyền thực hiện thao tác này");
  }

  return adminUser;
};

export const getCurrentAdminUser = cache(async () => {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
});


/**
 * Body of an admin write. Rejects script URLs anywhere in it, so a hijacked staff
 * account can't plant XSS on the storefront through a link field.
 */
export const readAdminJson = async (req: Request): Promise<unknown> => {
  const body: unknown = await req.json().catch(() => {
    throw new AuthError(400, "Dữ liệu không hợp lệ");
  });
  if (findScriptUrl(body)) throw new AuthError(400, "Đường dẫn không hợp lệ (không được dùng javascript:)");
  return body;
};

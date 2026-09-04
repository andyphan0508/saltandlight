import { cache } from "react";
import { prisma } from "@saltandlight/db";
import { createSupabaseServerClient } from "./supabase/server";

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Memoized per request: queries Supabase auth and admin_users once per HTTP request
 * even when called across layout, page, and child components.
 */
const getAuthenticatedAdmin = cache(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.adminUser.findUnique({
    where: { authUserId: user.id },
    select: {
      id: true,
      authUserId: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
});

/**
 * Verifies the Supabase session AND that the linked admin_users row is
 * active — a Supabase user alone isn't enough, since staff accounts are
 * only ever created by inviting through this app (no public sign-up).
 */
export async function requireAdmin(allowedRoles?: ("owner" | "staff")[]) {
  const adminUser = await getAuthenticatedAdmin();

  if (!adminUser) throw new AuthError(401, "Chưa đăng nhập");

  if (!adminUser.isActive) {
    throw new AuthError(403, "Tài khoản không có quyền truy cập");
  }

  if (allowedRoles && !allowedRoles.includes(adminUser.role)) {
    throw new AuthError(403, "Không đủ quyền thực hiện thao tác này");
  }

  return adminUser;
}

export const getCurrentAdminUser = cache(async () => {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
});


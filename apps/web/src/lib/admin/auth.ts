import { cache } from "react";
import { prisma } from "@saltandlight/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  // 1. Try finding by authUserId
  let admin = await prisma.adminUser.findUnique({
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

  // 2. Fallback: find by email and automatically link authUserId
  if (!admin && user.email) {
    const byEmail = await prisma.adminUser.findUnique({
      where: { email: user.email },
    });

    if (byEmail) {
      admin = await prisma.adminUser.update({
        where: { id: byEmail.id },
        data: { authUserId: user.id, isActive: true },
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
    } else {
      // Auto-provision owner for authenticated Supabase user
      admin = await prisma.adminUser.upsert({
        where: { email: user.email },
        update: { authUserId: user.id, isActive: true },
        create: {
          authUserId: user.id,
          email: user.email,
          fullName: (user.user_metadata as any)?.full_name || user.email.split("@")[0] || "Admin",
          role: "owner",
          isActive: true,
        },
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
    }
  }

  return admin;
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


import { prisma } from "@saltandlight/db";
import { createSupabaseServerClient } from "./supabase/server";

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Verifies the Supabase session AND that the linked admin_users row is
 * active — a Supabase user alone isn't enough, since staff accounts are
 * only ever created by inviting through this app (no public sign-up).
 */
export async function requireAdmin(allowedRoles?: ("owner" | "staff")[]) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new AuthError(401, "Chưa đăng nhập");

  const adminUser = await prisma.adminUser.findUnique({
    where: { authUserId: user.id },
  });

  if (!adminUser || !adminUser.isActive) {
    throw new AuthError(403, "Tài khoản không có quyền truy cập");
  }

  if (allowedRoles && !allowedRoles.includes(adminUser.role)) {
    throw new AuthError(403, "Không đủ quyền thực hiện thao tác này");
  }

  return adminUser;
}

export async function getCurrentAdminUser() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

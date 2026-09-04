import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự").optional(),
  role: z.enum(["owner", "staff"]),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").optional(),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin(["owner"]);
    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json({ users });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner"]);
    const input = bodySchema.parse(await req.json());

    const supabase = createSupabaseAdminClient();
    let authUserId: string | null = null;

    if (input.password) {
      // 1. Create direct user with password in Supabase Auth
      const { data: createdAuth, error: createError } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { full_name: input.fullName },
      });

      if (createError) {
        // If user already exists in Supabase Auth, update their password and link
        if (
          createError.message?.toLowerCase().includes("already registered") ||
          (createError as any).status === 422
        ) {
          const { data: usersList } = await supabase.auth.admin.listUsers();
          const existing = usersList?.users?.find(
            (u) => u.email?.toLowerCase() === input.email.toLowerCase(),
          );
          if (existing) {
            authUserId = existing.id;
            await supabase.auth.admin.updateUserById(existing.id, {
              password: input.password,
              user_metadata: { full_name: input.fullName },
            });
          } else {
            return NextResponse.json({ error: createError.message }, { status: 400 });
          }
        } else {
          return NextResponse.json(
            { error: createError.message || "Không thể tạo tài khoản xác thực" },
            { status: 400 },
          );
        }
      } else if (createdAuth.user) {
        authUserId = createdAuth.user.id;
      }
    } else {
      // Fallback: invite user by email
      const { data: inviteData, error: inviteError } =
        await supabase.auth.admin.inviteUserByEmail(input.email);
      if (inviteError || !inviteData.user) {
        return NextResponse.json(
          { error: inviteError?.message ?? "Không thể gửi lời mời" },
          { status: 400 },
        );
      }
      authUserId = inviteData.user.id;
    }

    // 2. Upsert into admin_users table
    const created = await prisma.adminUser.upsert({
      where: { email: input.email },
      update: {
        authUserId: authUserId ?? undefined,
        fullName: input.fullName,
        role: input.role,
        isActive: true,
      },
      create: {
        authUserId,
        email: input.email,
        fullName: input.fullName,
        role: input.role,
        isActive: true,
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "admin_user.create",
      entityType: "admin_user",
      entityId: created.id,
      metadata: { email: input.email, role: input.role, hasPassword: !!input.password },
    });

    return NextResponse.json({ user: created });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const schema = z.object({
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await requireAdmin(["owner"]);
    const { password } = schema.parse(await req.json());

    const targetUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    const supabase = createSupabaseAdminClient();
    let authUserId = targetUser.authUserId;

    if (!authUserId) {
      // Find by email in Supabase Auth
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const match = usersList?.users?.find((u) => u.email === targetUser.email);
      if (match) {
        authUserId = match.id;
        await prisma.adminUser.update({
          where: { id: targetUser.id },
          data: { authUserId: match.id },
        });
      } else {
        // Create user in Supabase Auth if not exists
        const { data: created, error: createError } =
          await supabase.auth.admin.createUser({
            email: targetUser.email,
            password,
            email_confirm: true,
            user_metadata: { full_name: targetUser.fullName },
          });

        if (createError || !created.user) {
          return NextResponse.json(
            { error: createError?.message || "Không thể tạo tài khoản xác thực" },
            { status: 400 },
          );
        }
        authUserId = created.user.id;
        await prisma.adminUser.update({
          where: { id: targetUser.id },
          data: { authUserId: created.user.id },
        });
      }
    }

    if (authUserId) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUserId,
        { password },
      );
      if (updateError) {
        return NextResponse.json(
          { error: updateError.message || "Không thể cập nhật mật khẩu" },
          { status: 400 },
        );
      }
    }

    await logAudit({
      adminUserId: admin.id,
      action: "admin_user.reset_password",
      entityType: "admin_user",
      entityId: targetUser.id,
      metadata: { targetEmail: targetUser.email },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật mật khẩu thành công!",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }
    console.error("Reset user password error:", err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

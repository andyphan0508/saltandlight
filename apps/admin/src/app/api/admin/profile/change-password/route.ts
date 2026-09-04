import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { newPassword } = changePasswordSchema.parse(body);

    const supabaseAdmin = createSupabaseAdminClient();

    let targetAuthId = admin.authUserId;

    // If authUserId is not linked, look up the user by email in Supabase Auth
    if (!targetAuthId) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const match = usersData?.users?.find((u) => u.email === admin.email);
      if (match) {
        targetAuthId = match.id;
      }
    }

    if (!targetAuthId) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản xác thực tương ứng trong hệ thống" },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetAuthId,
      { password: newPassword },
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Không thể cập nhật mật khẩu" },
        { status: 400 },
      );
    }

    await logAudit({
      adminUserId: admin.id,
      action: "admin_user.change_password",
      entityType: "admin_user",
      entityId: admin.id,
      metadata: { email: admin.email },
    });

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstIssue = err.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đổi mật khẩu" },
      { status: 500 },
    );
  }
}

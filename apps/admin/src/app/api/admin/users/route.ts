import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).optional(),
  role: z.enum(["owner", "staff"]),
});

export async function GET() {
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner"]);
    const input = bodySchema.parse(await req.json());

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(input.email);
    if (error || !data.user) {
      return NextResponse.json({ error: error?.message ?? "Không thể mời tài khoản" }, { status: 400 });
    }

    const created = await prisma.adminUser.create({
      data: {
        authUserId: data.user.id,
        email: input.email,
        fullName: input.fullName,
        role: input.role,
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "admin_user.invite",
      entityType: "admin_user",
      entityId: created.id,
      metadata: { email: input.email, role: input.role },
    });

    return NextResponse.json({ user: created });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

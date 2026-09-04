import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

const bodySchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["owner", "staff"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner"]);
    if (params.id === admin.id) {
      return NextResponse.json({ error: "Không thể tự thay đổi quyền của chính mình" }, { status: 400 });
    }
    const body = bodySchema.parse(await req.json());

    await prisma.adminUser.update({ where: { id: params.id }, data: body });
    await logAudit({
      adminUserId: admin.id,
      action: "admin_user.update",
      entityType: "admin_user",
      entityId: params.id,
      metadata: body,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

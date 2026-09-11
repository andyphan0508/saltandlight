import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["new", "in_progress", "closed"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const input = patchSchema.parse(body);

    const existing = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu liên hệ" }, { status: 404 });
    }

    const contact = await prisma.contactSubmission.update({
      where: { id },
      data: { status: input.status },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "contact.update_status",
      entityType: "contact_submission",
      entityId: id,
      metadata: { from: existing.status, to: input.status, fullName: existing.fullName },
    });

    return NextResponse.json({ contact });
  } catch (err) {
    return apiError(err, "Không thể cập nhật yêu cầu liên hệ");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const { id } = params;

    const existing = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu liên hệ" }, { status: 404 });
    }

    await prisma.contactSubmission.delete({ where: { id } });

    await logAudit({
      adminUserId: admin.id,
      action: "contact.delete",
      entityType: "contact_submission",
      entityId: id,
      metadata: { fullName: existing.fullName, phone: existing.phone },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "Không thể xóa yêu cầu liên hệ");
  }
}

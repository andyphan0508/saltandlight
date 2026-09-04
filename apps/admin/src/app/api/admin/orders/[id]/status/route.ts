import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  status: z.enum(["pending_payment", "processing", "on_hold", "completed", "cancelled", "refunded"]),
  note: z.string().max(500).optional(),
});

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const body = bodySchema.parse(await req.json());

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

    await prisma.$transaction([
      prisma.order.update({ where: { id: params.id }, data: { status: body.status } }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: params.id,
          fromStatus: order.status,
          toStatus: body.status,
          changedById: admin.id,
          note: body.note,
        },
      }),
    ]);

    await logAudit({
      adminUserId: admin.id,
      action: "order.status_change",
      entityType: "order",
      entityId: params.id,
      metadata: { from: order.status, to: body.status },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

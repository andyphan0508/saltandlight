import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  fee: z.number().nonnegative(),
  freeThreshold: z.number().nonnegative().nullable(),
  isActive: z.boolean(),
});

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner"]);
    const body = bodySchema.parse(await req.json());

    await prisma.shippingMethod.update({ where: { id: params.id }, data: body });
    await logAudit({
      adminUserId: admin.id,
      action: "shipping_method.update",
      entityType: "shipping_method",
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

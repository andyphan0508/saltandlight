import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();

    const payment = await prisma.paymentTransaction.findUnique({ where: { id: params.id } });
    if (!payment) return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    if (payment.status !== "awaiting_confirmation") {
      return NextResponse.json({ error: "Giao dịch đã được xử lý" }, { status: 409 });
    }

    await prisma.paymentTransaction.update({
      where: { id: params.id },
      data: { status: "rejected", confirmedById: admin.id, confirmedAt: new Date() },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "payment.reject",
      entityType: "payment_transaction",
      entityId: params.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

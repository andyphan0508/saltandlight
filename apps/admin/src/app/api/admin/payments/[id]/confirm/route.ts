import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendPaymentConfirmedEmail } from "@/lib/email";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();

    const payment = await prisma.paymentTransaction.findUnique({
      where: { id: params.id },
      include: { order: { include: { customer: true } } },
    });
    if (!payment) return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    if (payment.status !== "awaiting_confirmation") {
      return NextResponse.json({ error: "Giao dịch đã được xử lý" }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: params.id },
        data: { status: "confirmed", confirmedById: admin.id, confirmedAt: new Date() },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "processing" },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          fromStatus: payment.order.status,
          toStatus: "processing",
          changedById: admin.id,
          note: "Đã xác nhận chuyển khoản",
        },
      }),
    ]);

    await logAudit({
      adminUserId: admin.id,
      action: "payment.confirm",
      entityType: "payment_transaction",
      entityId: params.id,
    });

    sendPaymentConfirmedEmail({
      orderNumber: payment.order.orderNumber,
      customerEmail: payment.order.customer.email,
    }).catch((err) => console.error("sendPaymentConfirmedEmail failed", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

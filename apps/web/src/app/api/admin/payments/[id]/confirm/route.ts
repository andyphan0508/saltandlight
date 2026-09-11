import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { sendPaymentConfirmedEmail } from "@/lib/admin/email";

export const dynamic = "force-dynamic";

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

    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.update({
        where: { id: params.id },
        data: { status: "confirmed", confirmedById: admin.id, confirmedAt: new Date() },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "processing" },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          fromStatus: payment.order.status,
          toStatus: "processing",
          changedById: admin.id,
          note: "Đã xác nhận chuyển khoản",
        },
      });
    });

    await logAudit({
      adminUserId: admin.id,
      action: "payment.confirm",
      entityType: "payment_transaction",
      entityId: params.id,
    });

    try {
      revalidateTag("dashboard-stats");
    } catch {
      // Revalidation
    }

    try {
      await sendPaymentConfirmedEmail({
        orderNumber: payment.order.orderNumber,
        customerEmail: payment.order.customer.email,
      });
    } catch (err) {
      console.error("sendPaymentConfirmedEmail failed", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
}

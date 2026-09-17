import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError, readAdminJson } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { stockDirection } from "@/helpers/order-actions";
import { invalidateProductCaches } from "@/server/product-cache";

const bodySchema = z.object({
  status: z.enum(["pending_payment", "processing", "on_hold", "completed", "cancelled", "refunded"]),
  note: z.string().max(500).optional(),
});

export const dynamic = "force-dynamic";

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const admin = await requireAdmin();
    const body = bodySchema.parse(await readAdminJson(req));

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: { select: { productVariantId: true, quantity: true } } },
    });
    if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

    const direction = stockDirection(order.status, body.status);

    await prisma.$transaction(async (tx) => {
      // Only from the status read above: a double-click or a second admin can't restock twice
      const { count } = await tx.order.updateMany({ where: { id: params.id, status: order.status }, data: { status: body.status } });
      if (count === 0) throw new AuthError(409, "Đơn hàng vừa được cập nhật, vui lòng tải lại trang");
      // Placing the order took this stock; cancelling gives it back (and reviving takes it again).
      // Items whose variant was deleted since have nothing to restock.
      if (body.status === "completed") {
        await tx.paymentTransaction.updateMany({
          where: { orderId: params.id, method: "cod", status: "awaiting_confirmation" },
          data: { status: "confirmed", confirmedById: admin.id, confirmedAt: new Date() },
        });
      }
      if (direction !== 0) {
        for (const item of order.items) {
          if (!item.productVariantId) continue;
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stockQuantity: { increment: direction * item.quantity } },
          });
        }
      }
      await tx.orderStatusHistory.create({
        data: {
          orderId: params.id,
          fromStatus: order.status,
          toStatus: body.status,
          changedById: admin.id,
          note: body.note,
        },
      });
    });

    await logAudit({
      adminUserId: admin.id,
      action: "order.status_change",
      entityType: "order",
      entityId: params.id,
      metadata: { from: order.status, to: body.status, stockDirection: direction },
    });

    try {
      revalidateTag("dashboard-stats");
      if (direction !== 0) revalidateTag("products");
    } catch {
      // Revalidation
    }
    if (direction !== 0) invalidateProductCaches();

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
};

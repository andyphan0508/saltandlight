import { NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/server/admin/auth";
import { ACTIONABLE_ORDER_STATUSES } from "@/helpers/order-actions";

export const dynamic = "force-dynamic";

const INBOX_SIZE = 8;

/** Orders still waiting on the shop, newest first — polled by the admin order FAB. */
export const GET = async () => {
  try {
    await requireAdmin();
    const where = { status: { in: ACTIONABLE_ORDER_STATUSES } };

    const [count, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: INBOX_SIZE,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          customer: { select: { fullName: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return NextResponse.json(
      {
        count,
        orders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: Number(o.total),
          createdAt: o.createdAt.toISOString(),
          customerName: o.customer.fullName,
          itemCount: o._count.items,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return apiError(err, "Không tải được đơn hàng mới");
  }
};

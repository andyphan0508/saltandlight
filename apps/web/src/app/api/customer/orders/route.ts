import { NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { getAuthenticatedCustomer } from "@/lib/customer/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      select: {
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            productNameSnapshot: true,
            color: true,
            size: true,
            quantity: true,
            unitPrice: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: "asc" },
          select: { toStatus: true, changedAt: true, note: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("GET /api/customer/orders error:", err);
    return NextResponse.json({ error: "Không thể tải danh sách đơn hàng" }, { status: 500 });
  }
}

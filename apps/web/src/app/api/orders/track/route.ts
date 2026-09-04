import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { trackOrderSchema } from "@saltandlight/domain";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = trackOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Thông tin không hợp lệ" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: parsed.data.orderNumber.trim().toUpperCase(),
      customer: { phone: parsed.data.phone.trim() },
    },
    include: {
      items: true,
      statusHistory: { orderBy: { changedAt: "asc" } },
      shippingAddress: true,
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại." },
      { status: 404 },
    );
  }

  return NextResponse.json({ order });
}

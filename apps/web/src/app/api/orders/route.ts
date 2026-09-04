import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import {
  createOrderSchema,
  pickShippingFee,
  nextOrderNumber,
  buildVietQrUrl,
  buildTransferContent,
} from "@saltandlight/domain";
import { sendOrderCreatedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { customer, shippingAddress, items, note } = parsed.data;

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.productVariantId) }, isActive: true },
    include: { product: true },
  });

  const orderItemsInput = items.flatMap((item) => {
    const variant = variants.find((v) => v.id === item.productVariantId);
    if (!variant) return [];
    const quantity = Math.min(item.quantity, variant.stockQuantity);
    if (quantity <= 0) return [];
    return [
      {
        productId: variant.productId,
        productVariantId: variant.id,
        productNameSnapshot: variant.product.name,
        color: variant.color,
        size: variant.size,
        unitPrice: variant.price,
        quantity,
      },
    ];
  });

  if (orderItemsInput.length === 0) {
    return NextResponse.json({ error: "Giỏ hàng trống hoặc hết hàng." }, { status: 400 });
  }

  const subtotal = orderItemsInput.reduce(
    (sum, l) => sum + Number(l.unitPrice) * l.quantity,
    0,
  );

  const shippingMethods = await prisma.shippingMethod.findMany({ where: { isActive: true } });
  const shippingFee = pickShippingFee(
    subtotal,
    shippingMethods.map((m) => ({
      id: m.id,
      type: m.type,
      fee: Number(m.fee),
      freeThreshold: m.freeThreshold ? Number(m.freeThreshold) : null,
      isActive: m.isActive,
    })),
  );
  const total = subtotal + shippingFee;

  const order = await prisma.$transaction(async (tx) => {
    const customerRecord = await tx.customer.create({
      data: {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email || null,
        isGuest: true,
      },
    });

    const address = await tx.customerAddress.create({
      data: {
        customerId: customerRecord.id,
        recipientName: shippingAddress.recipientName,
        phone: shippingAddress.phone,
        province: shippingAddress.province,
        district: shippingAddress.district,
        ward: shippingAddress.ward,
        streetAddress: shippingAddress.streetAddress,
        isDefault: true,
      },
    });

    const orderNumber = await nextOrderNumber(tx);

    const created = await tx.order.create({
      data: {
        orderNumber,
        customerId: customerRecord.id,
        status: "pending_payment",
        subtotal,
        shippingFee,
        total,
        shippingAddressId: address.id,
        note: note || null,
        items: { create: orderItemsInput },
        statusHistory: {
          create: { fromStatus: null, toStatus: "pending_payment", note: "Đơn hàng được tạo" },
        },
        payments: {
          create: { method: "bank_transfer", amount: total, status: "awaiting_confirmation" },
        },
      },
      include: { items: true },
    });

    // Decrement stock for the purchased variants.
    for (const item of orderItemsInput) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    return created;
  });

  const vietqr = {
    bankBin: process.env.VIETQR_BANK_BIN ?? "",
    accountNo: process.env.VIETQR_ACCOUNT_NO ?? "",
    accountName: process.env.VIETQR_ACCOUNT_NAME ?? "",
  };
  const transferContent = buildTransferContent(order.orderNumber);
  const qrUrl =
    vietqr.bankBin && vietqr.accountNo
      ? buildVietQrUrl(vietqr, { amount: total, addInfo: transferContent })
      : null;

  try {
    await sendOrderCreatedEmail({
      orderNumber: order.orderNumber,
      customerEmail: customer.email || null,
      total,
    });
  } catch (err) {
    console.error("sendOrderCreatedEmail failed", err);
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    total,
    transferContent,
    qrUrl,
  });
}

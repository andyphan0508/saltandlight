import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import {
  createOrderSchema,
  pickShippingFee,
  nextOrderNumber,
  buildVietQrUrl,
  buildTransferContent,
  initialOrderStatus,
} from "@saltandlight/domain";
import { sendOrderCreatedEmail } from "@/server/email";
import { getAuthenticatedCustomer } from "@/server/customer-auth";
import { recordOrderAnalytics } from "@/server/analytics/order-events";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { customer, shippingAddress, items, note, paymentMethod } = parsed.data;
  const isCod = paymentMethod === "cod";

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

  const zones = await prisma.shippingZone.findMany({ include: { methods: true } });
  const shippingFee = pickShippingFee(
    subtotal,
    shippingAddress.provinceCode,
    zones.map((z) => ({
      id: z.id,
      provinceCodes: z.provinceCodes,
      methods: z.methods.map((m) => ({
        id: m.id,
        type: m.type,
        fee: Number(m.fee),
        freeThreshold: m.freeThreshold ? Number(m.freeThreshold) : null,
        isActive: m.isActive,
      })),
    })),
  );
  const total = subtotal + shippingFee;

  // If the buyer is logged in, attach this order to their account (and keep
  // their profile fresh with what they just typed) instead of spawning
  // another guest Customer row for the same person.
  const authenticatedCustomer = await getAuthenticatedCustomer();

  const order = await prisma.$transaction(async (tx) => {
    const customerRecord = authenticatedCustomer
      ? await tx.customer.update({
          where: { id: authenticatedCustomer.id },
          data: {
            fullName: customer.fullName,
            phone: customer.phone,
            email: customer.email || authenticatedCustomer.email,
          },
        })
      : await tx.customer.create({
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
        provinceCode: shippingAddress.provinceCode,
        district: shippingAddress.district ?? null,
        ward: shippingAddress.ward,
        wardCode: shippingAddress.wardCode,
        streetAddress: shippingAddress.streetAddress,
        isDefault: true,
      },
    });

    const orderNumber = await nextOrderNumber(tx);

    const created = await tx.order.create({
      data: {
        orderNumber,
        customerId: customerRecord.id,
        status: initialOrderStatus(paymentMethod),
        subtotal,
        shippingFee,
        total,
        shippingAddressId: address.id,
        note: note || null,
        items: { create: orderItemsInput },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: initialOrderStatus(paymentMethod),
            note: isCod ? "Đơn hàng được tạo · Thanh toán khi nhận hàng (COD)" : "Đơn hàng được tạo · Chuyển khoản ngân hàng",
          },
        },
        payments: {
          // COD: recorded so admin sees how the order is paid; confirmed when the order is marked delivered
          create: { method: paymentMethod, amount: total, status: "awaiting_confirmation" },
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
    !isCod && vietqr.bankBin && vietqr.accountNo
      ? buildVietQrUrl(vietqr, { amount: total, addInfo: transferContent })
      : null;

  recordOrderAnalytics(req, {
    total,
    items: orderItemsInput.map((item) => ({
      productId: item.productId,
      productName: item.productNameSnapshot,
      variant: [item.color, item.size].filter(Boolean).join(" / "),
      quantity: item.quantity,
      amount: Number(item.unitPrice) * item.quantity,
    })),
  });

  try {
    await sendOrderCreatedEmail({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: customer.fullName,
      customerEmail: customer.email || null,
      customerPhone: customer.phone,
      total,
      paymentMethod,
    });
  } catch (err) {
    console.error("sendOrderCreatedEmail failed", err);
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    total,
    transferContent,
    qrUrl,
    paymentMethod,
  });
};

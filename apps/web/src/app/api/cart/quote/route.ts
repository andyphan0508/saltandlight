import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { cartQuoteSchema, pickShippingFee } from "@saltandlight/domain";
import { getCachedActiveShippingMethods } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = cartQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const variantIds = parsed.data.items.map((i) => i.productVariantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    select: {
      id: true,
      productId: true,
      color: true,
      size: true,
      price: true,
      stockQuantity: true,
      product: {
        select: {
          name: true,
          slug: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  const lines = parsed.data.items.flatMap((item) => {
    const variant = variants.find((v) => v.id === item.productVariantId);
    if (!variant) return [];
    const quantity = Math.min(item.quantity, variant.stockQuantity);
    if (quantity <= 0) return [];
    return [
      {
        productVariantId: variant.id,
        productId: variant.productId,
        name: variant.product.name,
        slug: variant.product.slug,
        image: variant.product.images[0]?.url ?? null,
        color: variant.color,
        size: variant.size,
        unitPrice: Number(variant.price),
        quantity,
        lineTotal: Number(variant.price) * quantity,
        availableStock: variant.stockQuantity,
      },
    ];
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  const shippingMethods = await getCachedActiveShippingMethods();
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

  return NextResponse.json({
    lines,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
  });
}

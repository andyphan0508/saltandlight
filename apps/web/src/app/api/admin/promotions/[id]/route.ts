import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { computePriceRange } from "@saltandlight/domain";
import { promotionUpdateSchema } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const promotion = await prisma.promotion.findUnique({
      where: { id: params.id },
    });
    if (!promotion) return NextResponse.json({ error: "Không tìm thấy chương trình" }, { status: 404 });
    return NextResponse.json({ promotion });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const {
      name,
      badge,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive,
      productIds,
      applyPrices,
    } = promotionUpdateSchema.parse(await req.json());

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (badge !== undefined) data.badge = badge;
    if (description !== undefined) data.description = description;
    if (discountType !== undefined) data.discountType = discountType;
    if (discountValue !== undefined) data.discountValue = discountValue;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) data.isActive = isActive;
    if (productIds !== undefined) data.productIds = productIds;

    const updated = await prisma.promotion.update({
      where: { id: params.id },
      data,
    });

    if (applyPrices && updated.productIds.length > 0) {
      const numDiscount = Number(updated.discountValue);
      for (const pId of updated.productIds) {
        const variants = await prisma.productVariant.findMany({
          where: { productId: pId, isActive: true },
        });

        for (const v of variants) {
          const basePrice = v.compareAtPrice ? Number(v.compareAtPrice) : Number(v.price);
          let newPrice = basePrice;

          if (updated.discountType === "percent") {
            newPrice = Math.round((basePrice * (1 - numDiscount / 100)) / 1000) * 1000;
          } else {
            newPrice = Math.max(0, basePrice - numDiscount);
          }

          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              compareAtPrice: basePrice,
              price: newPrice,
            },
          });
        }

        const updatedVariants = await prisma.productVariant.findMany({
          where: { productId: pId, isActive: true },
          select: { price: true, compareAtPrice: true, isActive: true },
        });

        const range = computePriceRange(
          updatedVariants.map((u) => ({
            isActive: u.isActive,
            price: Number(u.price),
            compareAtPrice: u.compareAtPrice != null ? Number(u.compareAtPrice) : null,
          })),
        );

        await prisma.product.update({
          where: { id: pId },
          data: {
            minPrice: range.minPrice,
            maxCompareAtPrice: range.maxCompareAtPrice,
          },
        });
      }
    }

    return NextResponse.json({ promotion: updated });
  } catch (err) {
    return apiError(err, "Không thể cập nhật chương trình");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    await prisma.promotion.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Không thể xóa chương trình");
  }
}

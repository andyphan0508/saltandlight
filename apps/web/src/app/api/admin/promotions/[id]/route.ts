import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { computePriceRange } from "@saltandlight/domain";

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
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const body = await req.json();
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
    } = body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (badge !== undefined) data.badge = badge ? badge.trim() : null;
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (discountType !== undefined) data.discountType = discountType === "fixed" ? "fixed" : "percent";
    if (discountValue !== undefined) data.discountValue = Number(discountValue);
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (productIds !== undefined) data.productIds = Array.isArray(productIds) ? productIds : [];

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
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("PATCH /api/admin/promotions/[id] error:", err);
    return NextResponse.json({ error: "Không thể cập nhật chương trình" }, { status: 500 });
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
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Không thể xóa chương trình" }, { status: 500 });
  }
}

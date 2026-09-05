import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { computePriceRange } from "@saltandlight/domain";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ promotions });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("GET /api/admin/promotions error:", err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const {
      name,
      badge,
      description,
      discountType = "percent",
      discountValue,
      startDate,
      endDate,
      isActive = true,
      productIds = [],
      applyPrices = false,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập tên chương trình" }, { status: 400 });
    }

    const numDiscount = Number(discountValue);
    if (isNaN(numDiscount) || numDiscount <= 0) {
      return NextResponse.json({ error: "Giá trị giảm giá không hợp lệ" }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        name: name.trim(),
        badge: badge ? badge.trim() : null,
        description: description ? description.trim() : null,
        discountType: discountType === "fixed" ? "fixed" : "percent",
        discountValue: numDiscount,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: Boolean(isActive),
        productIds: Array.isArray(productIds) ? productIds : [],
      },
    });

    // If admin requested updating actual variant prices directly
    if (applyPrices && productIds.length > 0) {
      for (const pId of productIds) {
        const variants = await prisma.productVariant.findMany({
          where: { productId: pId, isActive: true },
        });

        for (const v of variants) {
          const basePrice = v.compareAtPrice ? Number(v.compareAtPrice) : Number(v.price);
          let newPrice = basePrice;

          if (discountType === "percent") {
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

        // Recompute product min/compare prices
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

    return NextResponse.json({ promotion });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("POST /api/admin/promotions error:", err);
    return NextResponse.json({ error: "Không thể tạo chương trình khuyến mãi" }, { status: 500 });
  }
}

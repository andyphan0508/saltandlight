import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { computePriceRange } from "@saltandlight/domain";
import { promotionCreateSchema } from "@/lib/admin/schemas";
import { invalidateMemoryCache } from "@/lib/memory-cache";

export const dynamic = "force-dynamic";

function invalidateProductCaches() {
  invalidateMemoryCache("catalog-products-");
  invalidateMemoryCache("homepage-featured-products-");
  invalidateMemoryCache("product-detail-");
  invalidateMemoryCache("related-products-");
}

export async function GET() {
  try {
    await requireAdmin();
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return NextResponse.json({ promotions });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const {
      name,
      badge,
      description,
      discountType,
      discountValue: numDiscount,
      startDate,
      endDate,
      isActive,
      productIds,
      applyPrices,
    } = promotionCreateSchema.parse(await req.json());

    const promotion = await prisma.promotion.create({
      data: {
        name,
        badge,
        description,
        discountType,
        discountValue: numDiscount,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive,
        productIds,
      },
    });

    // If admin requested updating actual variant prices directly
    if (applyPrices && productIds.length > 0) {
      for (const pId of productIds) {
        const variants = await prisma.productVariant.findMany({
          where: { productId: pId, isActive: true },
        });

        await Promise.all(
          variants.map((v) => {
            const basePrice = v.compareAtPrice ? Number(v.compareAtPrice) : Number(v.price);
            let newPrice = basePrice;

            if (discountType === "percent") {
              newPrice = Math.round((basePrice * (1 - numDiscount / 100)) / 1000) * 1000;
            } else {
              newPrice = Math.max(0, basePrice - numDiscount);
            }

            return prisma.productVariant.update({
              where: { id: v.id },
              data: {
                compareAtPrice: basePrice,
                price: newPrice,
              },
            });
          })
        );

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

    invalidateMemoryCache("active-promotions");
    if (applyPrices && productIds.length > 0) invalidateProductCaches();

    return NextResponse.json({ promotion });
  } catch (err) {
    return apiError(err, "Không thể tạo chương trình khuyến mãi");
  }
}

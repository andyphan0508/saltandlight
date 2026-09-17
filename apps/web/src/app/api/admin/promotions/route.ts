import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError, readAdminJson } from "@/server/admin/auth";
import { computePriceRange } from "@saltandlight/domain";
import { promotionCreateSchema } from "@/helpers/admin-schemas";
import { invalidateProductCaches } from "@/server/product-cache";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
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
      applyPrices: shouldApplyPrices,
    } = promotionCreateSchema.parse(await readAdminJson(req));

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
    if (shouldApplyPrices && productIds.length > 0) {
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

    if (shouldApplyPrices && productIds.length > 0) invalidateProductCaches();

    return NextResponse.json({ promotion });
  } catch (err) {
    return apiError(err, "Không thể tạo chương trình khuyến mãi");
  }
};

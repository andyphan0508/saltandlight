import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { computePriceRange } from "@saltandlight/domain";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { productInputSchema } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin(["owner", "staff"]);
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: true },
    });
    return NextResponse.json({ products });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const input = productInputSchema.parse(await req.json());
    const priceRange = computePriceRange(input.variants);

    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        categoryId: input.categoryId,
        status: input.status,
        isNew: input.isNew,
        isFeatured: input.isFeatured,
        minPrice: priceRange.minPrice,
        maxCompareAtPrice: priceRange.maxCompareAtPrice,
        images: { create: input.images },
        variants: {
          create: input.variants.map((v) => ({
            sku: v.sku,
            color: v.color,
            size: v.size,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stockQuantity: v.stockQuantity,
            isActive: v.isActive,
          })),
        },
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "product.create",
      entityType: "product",
      entityId: product.id,
      metadata: { name: product.name, slug: product.slug },
    });

    try {
      revalidateTag("products");
      revalidateTag("categories");
      revalidateTag("dashboard-stats");
    } catch {
      // Background revalidation
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { productInputSchema } from "@/lib/schemas";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
  });
  if (!product) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const input = productInputSchema.parse(await req.json());

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: params.id },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          categoryId: input.categoryId,
          status: input.status,
          isNew: input.isNew,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: params.id } });
      await tx.productImage.createMany({
        data: input.images.map((img) => ({ ...img, productId: params.id })),
      });

      const existingVariantIds = input.variants.filter((v) => v.id).map((v) => v.id!) as string[];
      await tx.productVariant.deleteMany({
        where: { productId: params.id, id: { notIn: existingVariantIds } },
      });
      for (const v of input.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              color: v.color,
              size: v.size,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stockQuantity: v.stockQuantity,
              isActive: v.isActive,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: params.id,
              sku: v.sku,
              color: v.color,
              size: v.size,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stockQuantity: v.stockQuantity,
              isActive: v.isActive,
            },
          });
        }
      }
    });

    await logAudit({
      adminUserId: admin.id,
      action: "product.update",
      entityType: "product",
      entityId: params.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    try {
      await prisma.product.delete({ where: { id: params.id } });
    } catch {
      // Product has order history (FK restrict) — archive instead of hard-deleting sales data.
      await prisma.product.update({ where: { id: params.id }, data: { status: "archived" } });
    }
    await logAudit({
      adminUserId: admin.id,
      action: "product.delete",
      entityType: "product",
      entityId: params.id,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

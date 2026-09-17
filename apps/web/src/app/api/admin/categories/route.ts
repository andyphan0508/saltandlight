import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { slugify } from "@/helpers/slugify";
import { invalidateProductCaches } from "@/server/product-cache";

export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Tên danh mục không được để trống"),
  slug: z.string().trim().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const GET = async (req: NextRequest) => {
  try {
    await requireAdmin(["owner", "staff"]);
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { taggedProducts: true } },
      },
      take: 2000,
    });
    return NextResponse.json({ categories });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json().catch(() => ({}));
    const input = categorySchema.parse(body);

    const baseSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
    let finalSlug = baseSlug || `danh-muc-${Date.now()}`;

    // Check duplicate slug
    const existing = await prisma.category.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: finalSlug,
        parentId: input.parentId || null,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { taggedProducts: true } },
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "category.create",
      entityType: "category",
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
    });

    invalidateProductCaches();

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    return apiError(err, "Không thể tạo danh mục");
  }
};

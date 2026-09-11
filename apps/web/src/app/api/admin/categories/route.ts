import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { slugify } from "@/lib/slugify";
import { invalidateMemoryCache } from "@/lib/memory-cache";

export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Tên danh mục không được để trống"),
  slug: z.string().trim().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(["owner", "staff"]);
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
      take: 2000,
    });
    return NextResponse.json({ categories });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
}

export async function POST(req: NextRequest) {
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
        _count: { select: { products: true } },
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "category.create",
      entityType: "category",
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
    });

    invalidateMemoryCache("nav-categories-with-counts");
    invalidateMemoryCache("catalog-products-");

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    return apiError(err, "Không thể tạo danh mục");
  }
}

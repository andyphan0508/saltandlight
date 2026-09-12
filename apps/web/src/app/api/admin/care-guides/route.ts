import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { DEFAULT_CARE_GUIDES, type CareGuide } from "@/lib/care-guide-types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin(["owner", "staff"]);

    const [settings, categories, products] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.findMany({
        where: { status: "published" },
        select: {
          id: true,
          name: true,
          slug: true,
          categoryId: true,
          images: { take: 1, select: { url: true }, orderBy: { sortOrder: "asc" } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const careGuides: CareGuide[] =
      Array.isArray(settings?.careGuides) && settings.careGuides.length > 0
        ? (settings.careGuides as unknown as CareGuide[])
        : DEFAULT_CARE_GUIDES;

    return NextResponse.json({
      careGuides,
      categories,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        imageUrl: p.images[0]?.url || null,
      })),
    });
  } catch (err) {
    return apiError(err, "Không thể tải hướng dẫn sử dụng");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const careGuides = body.careGuides;

    if (!Array.isArray(careGuides)) {
      return NextResponse.json(
        { error: "Dữ liệu hướng dẫn sử dụng không hợp lệ" },
        { status: 400 }
      );
    }

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        careGuides: careGuides as any,
      },
      create: {
        id: "default",
        careGuides: careGuides as any,
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "care_guides.update",
      entityType: "site_settings",
      entityId: "default",
      metadata: { count: careGuides.length },
    });

    try {
      revalidatePath("/san-pham", "layout");
      revalidatePath("/san-pham/[slug]", "page");
    } catch {
      // Best-effort revalidation
    }

    return NextResponse.json({
      success: true,
      careGuides: updated.careGuides,
    });
  } catch (err) {
    return apiError(err, "Không thể lưu hướng dẫn sử dụng");
  }
}

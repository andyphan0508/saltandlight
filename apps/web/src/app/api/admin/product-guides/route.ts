import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, Prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { invalidateMemoryCache } from "@/lib/memory-cache";
import { productGuidesSchema } from "@/lib/product-guides";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ guides: productGuidesSchema });

/** Replaces the whole guide list (it's small, and array order is the display order). */
export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const { guides } = bodySchema.parse(await req.json());
    const careGuides = guides as Prisma.InputJsonValue;

    await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: { careGuides },
      create: { id: "default", careGuides },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "product_guides.update",
      entityType: "site_settings",
      entityId: "default",
      metadata: { count: guides.length },
    });

    invalidateMemoryCache("product-guides");

    return NextResponse.json({ guides });
  } catch (err) {
    return apiError(err, "Không thể lưu hướng dẫn sản phẩm");
  }
}

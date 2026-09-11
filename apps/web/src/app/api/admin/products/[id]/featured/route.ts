import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { invalidateMemoryCache } from "@/lib/memory-cache";

export const dynamic = "force-dynamic";

const featuredSchema = z.object({
  isFeatured: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const { isFeatured } = featuredSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { isFeatured },
      select: { id: true, name: true, isFeatured: true },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "product.toggle_featured",
      entityType: "product",
      entityId: product.id,
      metadata: { name: product.name, isFeatured: product.isFeatured },
    });

    revalidateTag("products");
    invalidateMemoryCache("catalog-products-");
    invalidateMemoryCache("homepage-featured-products-");
    invalidateMemoryCache("product-detail-");

    return NextResponse.json({ success: true, product });
  } catch (err) {
    return apiError(err, "Không thể cập nhật trạng thái nổi bật");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

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

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("PATCH /api/admin/products/[id]/featured error:", err);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái nổi bật" }, { status: 500 });
  }
}

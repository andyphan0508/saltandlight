import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const bannerUpdateSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").optional(),
  subtitle: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  bgGradient: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const input = bannerUpdateSchema.parse(body);

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.subtitle !== undefined ? { subtitle: input.subtitle || null } : {}),
        ...(input.badge !== undefined ? { badge: input.badge || null } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl || null } : {}),
        ...(input.linkUrl !== undefined ? { linkUrl: input.linkUrl || "/san-pham" } : {}),
        ...(input.bgGradient !== undefined ? { bgGradient: input.bgGradient } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "banner.update",
      entityType: "banner",
      entityId: banner.id,
      metadata: { title: banner.title, isActive: banner.isActive },
    });

    revalidateTag("banners");

    return NextResponse.json({ banner });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("PATCH /api/admin/banners/[id] error:", err);
    return NextResponse.json({ error: "Không thể cập nhật banner" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner"]);
    const banner = await prisma.banner.delete({
      where: { id: params.id },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "banner.delete",
      entityType: "banner",
      entityId: banner.id,
      metadata: { title: banner.title },
    });

    revalidateTag("banners");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("DELETE /api/admin/banners/[id] error:", err);
    return NextResponse.json({ error: "Không thể xóa banner" }, { status: 500 });
  }
}

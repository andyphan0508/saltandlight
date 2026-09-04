import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const bannerSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  subtitle: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  bgGradient: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin(["owner", "staff"]);
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ banners });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const input = bannerSchema.parse(body);

    const banner = await prisma.banner.create({
      data: {
        title: input.title,
        subtitle: input.subtitle || null,
        badge: input.badge || null,
        imageUrl: input.imageUrl || null,
        linkUrl: input.linkUrl || "/san-pham",
        bgGradient: input.bgGradient || "from-[#e6f2e8] via-[#f4f9f5] to-[#faf9f6]",
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "banner.create",
      entityType: "banner",
      entityId: banner.id,
      metadata: { title: banner.title },
    });

    revalidateTag("banners");

    return NextResponse.json({ banner }, { status: 201 });
  } catch (err: any) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("POST /api/admin/banners error:", err);
    return NextResponse.json({ error: "Không thể tạo banner" }, { status: 500 });
  }
}

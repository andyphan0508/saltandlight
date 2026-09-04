import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { revalidatePageBlocks } from "@/lib/admin/page-blocks";
import { pageBlockCreateSchema, PAGE_SLUGS } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(["owner", "staff"]);
    const page = req.nextUrl.searchParams.get("page") || "home";
    if (!PAGE_SLUGS.includes(page as never)) {
      return NextResponse.json({ error: "Trang không hợp lệ" }, { status: 400 });
    }
    const blocks = await prisma.pageBlock.findMany({
      where: { page },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ blocks });
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
    const input = pageBlockCreateSchema.parse(body);

    const maxSortOrder = await prisma.pageBlock.aggregate({
      where: { page: input.page },
      _max: { sortOrder: true },
    });

    const block = await prisma.pageBlock.create({
      data: {
        page: input.page,
        type: input.type,
        content: input.content,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "page_block.create",
      entityType: "page_block",
      entityId: block.id,
      metadata: { page: block.page, type: block.type },
    });

    revalidatePageBlocks(input.page);

    return NextResponse.json({ block }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("POST /api/admin/page-blocks error:", err);
    return NextResponse.json({ error: "Không thể tạo block" }, { status: 500 });
  }
}

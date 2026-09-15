import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { revalidatePageBlocks } from "@/server/admin/page-blocks";
import { pageBlockCreateSchema, PAGE_SLUGS } from "@/helpers/admin-schemas";
import { getOrSeedPageBlocks } from "@/server/admin/page-block-defaults";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(["owner", "staff"]);
    const page = req.nextUrl.searchParams.get("page") || "home";
    if (!PAGE_SLUGS.includes(page as never)) {
      return NextResponse.json({ error: "Trang không hợp lệ" }, { status: 400 });
    }
    const blocks = await getOrSeedPageBlocks(page);
    return NextResponse.json({ blocks });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
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
    return apiError(err, "Không thể tạo block");
  }
}

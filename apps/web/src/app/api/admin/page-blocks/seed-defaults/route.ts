import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { revalidatePageBlocks } from "@/lib/admin/page-blocks";
import { PAGE_SLUGS } from "@/lib/admin/schemas";
import { PAGE_DEFAULT_BLOCKS } from "@/lib/page-block-defaults";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const page = body.page;

    if (!PAGE_SLUGS.includes(page as never)) {
      return NextResponse.json({ error: "Trang không hợp lệ" }, { status: 400 });
    }

    const defaults = PAGE_DEFAULT_BLOCKS[page];
    if (!defaults || defaults.length === 0) {
      return NextResponse.json({ error: "Chưa có khối mẫu chuẩn cho trang này" }, { status: 404 });
    }

    const maxSortOrder = await prisma.pageBlock.aggregate({
      where: { page },
      _max: { sortOrder: true },
    });

    let currentSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const created = await prisma.$transaction(
      defaults.map((d, i) =>
        prisma.pageBlock.create({
          data: {
            page,
            type: d.type as never,
            sortOrder: currentSortOrder + i,
            isVisible: d.isVisible ?? true,
            content: d.content,
          },
        })
      )
    );

    await logAudit({
      adminUserId: admin.id,
      action: "page_block.seed_defaults",
      entityType: "page_block",
      entityId: page,
      metadata: { page, count: created.length },
    });

    revalidatePageBlocks(page);

    return NextResponse.json({ blocks: created }, { status: 201 });
  } catch (err) {
    return apiError(err, "Không thể khởi tạo khối mẫu");
  }
}

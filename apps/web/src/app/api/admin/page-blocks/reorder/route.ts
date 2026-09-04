import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { revalidatePageBlocks } from "@/lib/admin/page-blocks";
import { pageBlockReorderSchema } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const { page, orderedIds } = pageBlockReorderSchema.parse(body);

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.pageBlock.updateMany({
          where: { id, page },
          data: { sortOrder: index },
        }),
      ),
    );

    await logAudit({
      adminUserId: admin.id,
      action: "page_block.reorder",
      entityType: "page_block",
      entityId: page,
      metadata: { page, orderedIds },
    });

    revalidatePageBlocks(page);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("POST /api/admin/page-blocks/reorder error:", err);
    return NextResponse.json({ error: "Không thể sắp xếp lại block" }, { status: 500 });
  }
}

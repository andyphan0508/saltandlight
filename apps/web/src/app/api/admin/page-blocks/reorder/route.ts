import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { revalidatePageBlocks } from "@/lib/admin/page-blocks";
import { pageBlockReorderSchema } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const { page, orderedIds } = pageBlockReorderSchema.parse(body);

    await prisma.$transaction(async (tx) => {
      for (let index = 0; index < orderedIds.length; index++) {
        await tx.pageBlock.updateMany({
          where: { id: orderedIds[index], page },
          data: { sortOrder: index },
        });
      }
    });

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
    return apiError(err, "Không thể sắp xếp lại block");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError, readAdminJson } from "@/server/admin/auth";
import { logAudit } from "@/server/admin/audit";
import { revalidatePageBlocks } from "@/server/admin/page-blocks";
import { pageBlockReorderSchema } from "@/helpers/admin-schemas";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest) => {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await readAdminJson(req);
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
};

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { revalidatePageBlocks } from "@/lib/admin/page-blocks";
import { pageBlockUpdateSchema } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const body = await req.json();
    const input = pageBlockUpdateSchema.parse(body);

    const block = await prisma.pageBlock.update({
      where: { id: params.id },
      data: {
        ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "page_block.update",
      entityType: "page_block",
      entityId: block.id,
      metadata: { page: block.page, isVisible: block.isVisible },
    });

    revalidatePageBlocks(block.page);

    return NextResponse.json({ block });
  } catch (err) {
    return apiError(err, "Không thể cập nhật block");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const block = await prisma.pageBlock.delete({ where: { id: params.id } });

    await logAudit({
      adminUserId: admin.id,
      action: "page_block.delete",
      entityType: "page_block",
      entityId: block.id,
      metadata: { page: block.page, type: block.type },
    });

    revalidatePageBlocks(block.page);

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Không thể xóa block");
  }
}

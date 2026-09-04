import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { revalidatePageBlocks } from "@/lib/page-blocks";
import { pageBlockUpdateSchema } from "@/lib/schemas";

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
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("PATCH /api/admin/page-blocks/[id] error:", err);
    return NextResponse.json({ error: "Không thể cập nhật block" }, { status: 500 });
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
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("DELETE /api/admin/page-blocks/[id] error:", err);
    return NextResponse.json({ error: "Không thể xóa block" }, { status: 500 });
  }
}

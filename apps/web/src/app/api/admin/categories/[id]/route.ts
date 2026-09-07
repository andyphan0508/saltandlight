import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { requireAdmin, AuthError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { slugify } from "@/lib/slugify";

export const dynamic = "force-dynamic";

const updateCategorySchema = z.object({
  name: z.string().trim().min(1, "Tên danh mục không được để trống").optional(),
  slug: z.string().trim().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const input = updateCategorySchema.parse(body);

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
    }

    const dataToUpdate: Record<string, any> = {};
    if (input.name !== undefined) dataToUpdate.name = input.name;
    if (input.parentId !== undefined) {
      // Prevent setting self as parent
      if (input.parentId === id) {
        return NextResponse.json({ error: "Không thể chọn chính danh mục này làm danh mục cha" }, { status: 400 });
      }
      dataToUpdate.parentId = input.parentId;
    }
    if (input.slug !== undefined) {
      let finalSlug = slugify(input.slug || input.name || existing.name);
      if (finalSlug !== existing.slug) {
        const slugConflict = await prisma.category.findUnique({ where: { slug: finalSlug } });
        if (slugConflict && slugConflict.id !== id) {
          finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
        }
      }
      dataToUpdate.slug = finalSlug;
    }

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });

    await logAudit({
      adminUserId: admin.id,
      action: "category.update",
      entityType: "category",
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
    });

    return NextResponse.json({ category });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("PATCH /api/admin/categories/[id] error:", err);
    return NextResponse.json({ error: "Không thể cập nhật danh mục" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner", "staff"]);
    const { id } = params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        {
          error: `Danh mục này đang có ${existing._count.products} sản phẩm. Vui lòng chuyển các sản phẩm sang danh mục khác trước khi xóa.`,
        },
        { status: 400 }
      );
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        {
          error: `Danh mục này có ${existing._count.children} danh mục con. Vui lòng xóa hoặc đổi danh mục cha của các danh mục con trước.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await logAudit({
      adminUserId: admin.id,
      action: "category.delete",
      entityType: "category",
      entityId: id,
      metadata: { name: existing.name, slug: existing.slug },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("DELETE /api/admin/categories/[id] error:", err);
    return NextResponse.json({ error: "Không thể xóa danh mục" }, { status: 500 });
  }
}

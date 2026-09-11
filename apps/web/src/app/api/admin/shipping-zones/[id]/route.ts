import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { invalidateMemoryCache } from "@/lib/memory-cache";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(["owner"]);

    await prisma.shippingZone.delete({ where: { id: params.id } });

    await logAudit({
      adminUserId: admin.id,
      action: "shipping_zone.delete",
      entityType: "shipping_zone",
      entityId: params.id,
    });

    revalidateTag("shipping");
    invalidateMemoryCache("shipping-zones");

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
}

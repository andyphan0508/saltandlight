import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/server/admin/auth";

export const dynamic = "force-dynamic";

/** The campaign's codes as CSV (unused only by default), to print or send out. */
export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await requireAdmin(["owner", "staff"]);
    const isAll = req.nextUrl.searchParams.get("status") === "all";
    const campaign = await prisma.couponCampaign.findUniqueOrThrow({
      where: { id: params.id },
      select: {
        name: true,
        coupons: {
          where: isAll ? {} : { usedAt: null },
          orderBy: { createdAt: "asc" },
          select: { code: true, usedAt: true, order: { select: { orderNumber: true } } },
        },
      },
    });

    // Codes are [A-Z0-9-] and order numbers SL-…, so nothing here needs CSV quoting
    const rows = isAll
      ? ["ma,trang_thai,don_hang", ...campaign.coupons.map((c) => `${c.code},${c.usedAt ? "da_dung" : "chua_dung"},${c.order?.orderNumber ?? ""}`)]
      : ["ma", ...campaign.coupons.map((c) => c.code)];
    const filename = `ma-giam-gia-${params.id.slice(0, 8)}${isAll ? "-tat-ca" : ""}.csv`;

    return new NextResponse(`﻿${rows.join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return apiError(err, "Không thể xuất danh sách mã");
  }
};

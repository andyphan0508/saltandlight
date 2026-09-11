import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";
import { requireAdmin, apiError } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(["owner", "staff"]);
    const status = req.nextUrl.searchParams.get("status");
    const type = req.nextUrl.searchParams.get("type");
    const q = req.nextUrl.searchParams.get("q")?.trim();

    const where: any = {};
    if (status && ["new", "in_progress", "closed"].includes(status)) {
      where.status = status;
    }
    if (type && ["contact", "custom_order"].includes(type)) {
      where.type = type;
    }
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
      ];
    }

    const contacts = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ contacts });
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra khi tải dữ liệu liên hệ");
  }
}

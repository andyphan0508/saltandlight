import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/admin/auth";
import { getDashboardStats } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    return apiError(err, "Có lỗi xảy ra");
  }
}

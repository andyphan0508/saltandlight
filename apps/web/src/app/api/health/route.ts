import { NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const start = Date.now();
    const categoriesCount = await prisma.category.count();
    return NextResponse.json({ ok: true, categoriesCount, latencyMs: Date.now() - start });
  } catch (err) {
    console.error("GET /api/health error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

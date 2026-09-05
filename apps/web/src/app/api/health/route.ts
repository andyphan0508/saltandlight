import { NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const start = Date.now();
    const categoriesCount = await prisma.category.count();
    return NextResponse.json({ ok: true, categoriesCount, latencyMs: Date.now() - start });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Database connection failed" },
      { status: 500 },
    );
  }
}

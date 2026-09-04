import { NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, any> = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDirectUrl: !!process.env.DIRECT_URL,
    nodeEnv: process.env.NODE_ENV,
    dbUrlHost: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:\/\/.*@/, "://***@")
      : null,
  };

  try {
    const start = Date.now();
    const categoriesCount = await prisma.category.count();
    result.databaseConnected = true;
    result.categoriesCount = categoriesCount;
    result.latencyMs = Date.now() - start;
  } catch (err: any) {
    result.databaseConnected = false;
    result.dbError = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      clientVersion: err?.clientVersion,
    };
  }

  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from "next/server";
import { getCachedPublishedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Lightweight preview results for the Spotlight-style search overlay — full results live at /san-pham?q=. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json(
      { products: [], total: 0 },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  }

  const { products, total } = await getCachedPublishedProducts({ query: q, pageSize: 6, sort: "latest" });
  return NextResponse.json(
    { products, total },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}

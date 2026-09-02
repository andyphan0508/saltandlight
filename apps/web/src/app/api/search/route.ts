import { NextRequest, NextResponse } from "next/server";
import { listPublishedProducts } from "@/lib/queries";

/** Lightweight preview results for the Spotlight-style search overlay — full results live at /san-pham?q=. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ products: [], total: 0 });

  const { products, total } = await listPublishedProducts({ query: q, pageSize: 6, sort: "latest" });
  return NextResponse.json({ products, total });
}

import { NextResponse } from "next/server";
import { getAllLocations } from "@saltandlight/domain/vn-locations";

/** Static Vietnam administrative dataset (34 provinces + wards) — vendored, never changes at runtime. */
export async function GET() {
  return NextResponse.json(
    { provinces: getAllLocations() },
    { headers: { "Cache-Control": "public, max-age=2592000, immutable" } },
  );
}

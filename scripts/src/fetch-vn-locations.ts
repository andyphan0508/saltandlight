/**
 * One-time data pull: fetches Vietnam's post-2025-reform administrative
 * divisions (34 provincial units, 2-tier Province/City → Ward/Commune,
 * district level abolished 1/7/2025) from the free, keyless
 * provinces.open-api.vn v2 API, and vendors the result as a static JSON
 * file so checkout never depends on a third-party API at runtime.
 *
 * Usage: pnpm --filter @saltandlight/scripts fetch:vn-locations
 *
 * Re-run only if Vietnam restructures its administrative map again.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const API_BASE = "https://provinces.open-api.vn/api/v2";

interface ApiProvince {
  code: number;
  name: string;
}

interface ApiWard {
  code: number;
  name: string;
}

interface ApiProvinceDetail extends ApiProvince {
  wards: ApiWard[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function main() {
  console.log("Fetching province list...");
  const provinces = await fetchJson<ApiProvince[]>(`${API_BASE}/p/`);
  console.log(`  → ${provinces.length} provinces found`);

  const result: { code: number; name: string; wards: { code: number; name: string }[] }[] = [];

  for (const p of provinces) {
    const detail = await fetchJson<ApiProvinceDetail>(`${API_BASE}/p/${p.code}?depth=2`);
    result.push({
      code: detail.code,
      name: detail.name,
      wards: detail.wards.map((w) => ({ code: w.code, name: w.name })),
    });
    console.log(`  → ${detail.name}: ${detail.wards.length} wards`);
    // Be polite to a free, keyless public API.
    await new Promise((r) => setTimeout(r, 150));
  }

  const totalWards = result.reduce((sum, p) => sum + p.wards.length, 0);
  console.log(`\nTotal: ${result.length} provinces, ${totalWards} wards`);

  const outPath = join(__dirname, "..", "..", "packages", "domain", "src", "data", "vn-locations.json");
  writeFileSync(outPath, JSON.stringify({ provinces: result }), "utf-8");
  console.log(`Written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

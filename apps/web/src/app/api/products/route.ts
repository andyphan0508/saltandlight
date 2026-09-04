import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  const categorySlug = req.nextUrl.searchParams.get("category") ?? undefined;
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = 24;

  const products = await prisma.product.findMany({
    where: {
      status: "published",
      ...(ids ? { id: { in: ids.split(",").filter(Boolean) } } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: ids ? undefined : (page - 1) * pageSize,
    take: ids ? undefined : pageSize,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true } },
    },
  });

  return NextResponse.json({
    products: products.map((p) => {
      const prices = p.variants.map((v) => Number(v.price));
      const compareAts = p.variants
        .map((v) => (v.compareAtPrice ? Number(v.compareAtPrice) : null))
        .filter((v): v is number => v != null);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        isNew: p.isNew,
        imageUrl: p.images[0]?.url ?? null,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxCompareAtPrice: compareAts.length ? Math.max(...compareAts) : null,
        colors: Array.from(new Set(p.variants.map((v) => v.color).filter(Boolean))),
        sizes: Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean))),
      };
    }),
  });
}

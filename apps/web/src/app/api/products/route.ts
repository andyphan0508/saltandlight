import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saltandlight/db";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const GET = async (req: NextRequest) => {
  try {
    const ids = req.nextUrl.searchParams.get("ids");
    const categorySlug = req.nextUrl.searchParams.get("category") ?? undefined;
    const page = Math.max(1, Math.floor(Number(req.nextUrl.searchParams.get("page"))) || 1);
    const pageSize = 24;
    // ids come from the visitor's own wishlist / compare storage: keep only well-formed uuids, and not thousands
    const idList = ids?.split(",").filter((id) => UUID.test(id)).slice(0, 100);

    const products = await prisma.product.findMany({
      where: {
        status: "published",
        ...(idList ? { id: { in: idList } } : {}),
        ...(categorySlug ? { categories: { some: { slug: categorySlug } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: ids ? undefined : (page - 1) * pageSize,
      take: ids ? undefined : pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        isNew: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        variants: {
          where: { isActive: true },
          select: { price: true, compareAtPrice: true, color: true, size: true },
        },
      },
    });

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
};

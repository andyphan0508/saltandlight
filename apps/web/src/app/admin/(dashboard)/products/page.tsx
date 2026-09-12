import { prisma } from "@saltandlight/db";
import { ProductsView, type ProductRow } from "@/components/admin";

const PAGE_SIZE = 10;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string; category?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim();
  const status = searchParams.status;
  const categoryId = searchParams.category;

  const where: any = {
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status: status as never } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  let products: ProductRow[] = [];
  let total = 0;
  let categories: { id: string; name: string }[] = [];
  let loadError = false;

  try {
    [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          status: true,
          isFeatured: true,
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
          variants: { select: { price: true, compareAtPrice: true, stockQuantity: true } },
        },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);
  } catch (err) {
    // Log full detail server-side (the client only ever sees an opaque
    // digest in production) — surfaces in `wrangler tail`/Cloudflare logs
    // instead of only showing up as an unexplained crash for the admin.
    console.error("[admin/products] data fetch failed:", err);
    loadError = true;
  }

  return (
    <ProductsView
      products={products}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      q={q}
      status={status}
      categoryId={categoryId}
      categories={categories}
      loadError={loadError}
    />
  );
}

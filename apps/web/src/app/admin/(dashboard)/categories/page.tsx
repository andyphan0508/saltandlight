import { prisma } from "@saltandlight/db";
import { CategoryManager, type CategoryItem } from "./CategoryManager";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim();

  const where: any = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;

  const [
    categories,
    total,
    parentOptions,
    totalProductsCount,
    totalCategoriesCount,
    totalTopLevelCount,
  ] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    }),
    prisma.category.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.count({
      where: { categoryId: { not: null } },
    }),
    prisma.category.count(),
    prisma.category.count({
      where: { parentId: null },
    }),
  ]);

  return (
    <CategoryManager
      initialCategories={JSON.parse(JSON.stringify(categories)) as CategoryItem[]}
      parentOptions={parentOptions}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      currentQ={q || ""}
      stats={{
        totalCategories: totalCategoriesCount,
        totalProducts: totalProductsCount,
        topLevelCategories: totalTopLevelCount,
      }}
    />
  );
}

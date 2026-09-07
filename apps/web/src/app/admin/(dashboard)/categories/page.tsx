import { prisma } from "@saltandlight/db";
import { CategoryManager, type CategoryItem } from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <CategoryManager
      initialCategories={JSON.parse(JSON.stringify(categories)) as CategoryItem[]}
    />
  );
}

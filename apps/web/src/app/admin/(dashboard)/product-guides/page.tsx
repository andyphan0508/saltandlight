import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { getProductGuides } from "@/lib/queries";
import { ProductGuidesManager } from "./ProductGuidesManager";

export const dynamic = "force-dynamic";

export default async function ProductGuidesPage() {
  const [guides, categories] = await Promise.all([
    getProductGuides(),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hướng dẫn sản phẩm"
        subtitle="Hướng dẫn bảo quản, bảng size, điểm nổi bật… tạo một lần, gán theo danh mục — mọi sản phẩm trong danh mục tự hiển thị"
      />
      <ProductGuidesManager initialGuides={guides} categories={categories} />
    </div>
  );
}

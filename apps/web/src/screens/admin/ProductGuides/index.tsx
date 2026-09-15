import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { getProductGuides } from "@/server/queries";
import { ProductGuidesManager } from "./components/ProductGuidesManager";

const ProductGuidesPage = async () => {
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
};

export default ProductGuidesPage;

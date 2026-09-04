import { prisma } from "@saltandlight/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { BackLink } from "@/components/admin/BackLink";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <BackLink href="/admin/products" label="Quay lại danh sách sản phẩm" />
      <PageHeader title="Thêm sản phẩm" subtitle="Điền thông tin, upload ảnh và tạo biến thể cho sản phẩm mới" />
      <ProductForm categories={categories} />
    </div>
  );
}

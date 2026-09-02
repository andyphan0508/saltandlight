import { prisma } from "@saltandlight/db";
import { ProductForm } from "@/components/ProductForm";
import { PageHeader } from "@/components/PageHeader";
import { BackLink } from "@/components/BackLink";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <BackLink href="/products" label="Quay lại danh sách sản phẩm" />
      <PageHeader title="Thêm sản phẩm" subtitle="Điền thông tin, upload ảnh và tạo biến thể cho sản phẩm mới" />
      <ProductForm categories={categories} />
    </div>
  );
}

import { prisma } from "@saltandlight/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { BackLink } from "@/components/admin/BackLink";

export default async function NewProductPage() {
  const [categories, promotions] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.promotion.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/products" label="Quay lại danh sách sản phẩm" />
      <PageHeader title="Thêm sản phẩm" subtitle="Điền thông tin, upload ảnh và tạo biến thể cho sản phẩm mới" />
      <ProductForm
        categories={categories}
        promotions={promotions.map((p) => ({
          id: p.id,
          name: p.name,
          badge: p.badge,
          discountType: p.discountType,
          discountValue: Number(p.discountValue),
        }))}
      />
    </div>
  );
}

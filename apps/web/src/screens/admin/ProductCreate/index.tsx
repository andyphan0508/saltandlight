import { z } from "zod";
import { prisma } from "@saltandlight/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { BackLink } from "@/components/admin/BackLink";
import { toProductCopy } from "@/helpers/product-copy";
import { loadProductFormInitial } from "@/server/admin/product-form-initial";

/** `?from=<product id>` (the "Nhân bản" button) starts the form from a copy of that product. */
const NewProductPage = async ({ searchParams }: { searchParams?: { from?: string } }) => {
  const sourceId = z.string().uuid().safeParse(searchParams?.from);
  const [categories, promotions, source] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.promotion.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    sourceId.success ? loadProductFormInitial(sourceId.data) : null,
  ]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/products" label="Quay lại danh sách sản phẩm" />
      {source ? (
        <PageHeader
          title="Nhân bản sản phẩm"
          subtitle={`Bản sao của “${source.name}” — sửa tên, ảnh, giá rồi bấm Tạo sản phẩm. Lưu ở dạng bản nháp.`}
        />
      ) : (
        <PageHeader title="Thêm sản phẩm" subtitle="Điền thông tin, upload ảnh và tạo biến thể cho sản phẩm mới" />
      )}
      <ProductForm
        categories={categories}
        promotions={promotions.map((p) => ({
          id: p.id,
          name: p.name,
          badge: p.badge,
          discountType: p.discountType,
          discountValue: Number(p.discountValue),
        }))}
        initial={source ? toProductCopy(source) : undefined}
      />
    </div>
  );
};

export default NewProductPage;

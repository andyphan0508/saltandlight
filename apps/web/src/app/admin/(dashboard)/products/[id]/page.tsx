import { notFound } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { BackLink } from "@/components/admin/BackLink";
import { toPlain } from "@/lib/serialize";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, promotions] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.promotion.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const plain = toPlain(product);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/products" label="Quay lại danh sách sản phẩm" />
      <PageHeader title={plain.name} subtitle="Chỉnh sửa thông tin, ảnh, giá và biến thể sản phẩm" />
      <ProductForm
        categories={categories}
        promotions={promotions.map((p) => ({
          id: p.id,
          name: p.name,
          badge: p.badge,
          discountType: p.discountType,
          discountValue: Number(p.discountValue),
        }))}
        initial={{
          id: plain.id,
          name: plain.name,
          slug: plain.slug,
          description: plain.description ?? "",
          categoryId: plain.categoryId,
          status: plain.status,
          isNew: plain.isNew,
          isFeatured: plain.isFeatured,
          images: plain.images.map((img) => ({
            url: img.url,
            sortOrder: img.sortOrder,
          })),
          variants: plain.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            color: v.color ?? "",
            size: v.size ?? "",
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            stockQuantity: v.stockQuantity,
            isActive: v.isActive,
          })),
        }}
      />
    </div>
  );
}

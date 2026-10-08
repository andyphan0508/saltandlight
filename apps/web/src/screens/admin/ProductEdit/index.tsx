import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { BackLink } from "@/components/admin/BackLink";
import { Copy } from "@/components/admin/Icons";
import { loadProductFormInitial } from "@/server/admin/product-form-initial";

const EditProductPage = async ({ params }: { params: { id: string } }) => {
  const [initial, categories, promotions] = await Promise.all([
    loadProductFormInitial(params.id),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.promotion.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!initial) notFound();

  return (
    <div className="space-y-6">
      <BackLink href="/admin/products" label="Quay lại danh sách sản phẩm" />
      <PageHeader
        title={initial.name}
        subtitle="Chỉnh sửa thông tin, ảnh, giá và biến thể sản phẩm"
        action={
          <Link
            href={`/admin/products/new?from=${initial.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-ink shadow-sm transition-all hover:border-brand-forest hover:text-brand-forest active:scale-95"
          >
            <Copy size={15} />
            <span>Nhân bản sản phẩm</span>
          </Link>
        }
      />
      <ProductForm
        categories={categories}
        promotions={promotions.map((p) => ({
          id: p.id,
          name: p.name,
          badge: p.badge,
          discountType: p.discountType,
          discountValue: Number(p.discountValue),
        }))}
        initial={initial}
      />
    </div>
  );
};

export default EditProductPage;

import { notFound } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { ProductForm } from "@/components/ProductForm";
import { toPlain } from "@/lib/serialize";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const plain = toPlain(product);

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase">Sửa sản phẩm</h1>
      <div className="mt-6">
        <ProductForm
          categories={categories}
          initial={{
            id: plain.id,
            name: plain.name,
            slug: plain.slug,
            description: plain.description ?? "",
            categoryId: plain.categoryId,
            status: plain.status,
            isNew: plain.isNew,
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
    </div>
  );
}

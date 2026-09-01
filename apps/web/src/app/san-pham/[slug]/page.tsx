import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductBuyBox } from "@/components/ProductBuyBox";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return { title: product?.name ?? "Sản phẩm" };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const plain = toPlain(product);
  const variants = plain.variants.map((v) => ({
    id: v.id,
    color: v.color,
    size: v.size,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
    stockQuantity: v.stockQuantity,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={plain.images} productName={plain.name} />
        <div>
          <h1 className="font-display text-2xl font-black uppercase">{plain.name}</h1>
          <div className="mt-4">
            <ProductBuyBox productId={plain.id} variants={variants} />
          </div>
          {plain.description && (
            <div className="prose prose-sm mt-8 max-w-none whitespace-pre-line text-ink/80">
              {plain.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

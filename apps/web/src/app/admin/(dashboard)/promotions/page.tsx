import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { toPlain } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const [promotionsData, productsData] = await Promise.all([
    prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "published" },
      select: {
        id: true,
        name: true,
        minPrice: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const promotions = toPlain(promotionsData).map((p: any) => ({
    ...p,
    discountValue: Number(p.discountValue),
    createdAt: String(p.createdAt),
    startDate: p.startDate ? String(p.startDate) : null,
    endDate: p.endDate ? String(p.endDate) : null,
  }));
  const products = toPlain(productsData).map((p: any) => ({
    id: p.id,
    name: p.name,
    minPrice: p.minPrice ? Number(p.minPrice) : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chương Trình Giảm Giá &amp; Khuyến Mãi"
        subtitle="Quản lý các đợt ưu đãi, mức giảm giá và sản phẩm áp dụng đồng bộ toàn hệ thống"
      />

      <PromotionsManager initialPromotions={promotions} products={products} />
    </div>
  );
}

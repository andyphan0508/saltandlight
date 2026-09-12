import { prisma } from "@saltandlight/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { PromotionsView } from "@/components/admin";
import { toPlain } from "@/lib/serialize";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [promotionsData, total, productsData] = await Promise.all([
    prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.promotion.count(),
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

      <PromotionsView
        initialPromotions={promotions}
        products={products}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}

import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { BannersView } from "@/components/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function BannersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const current = await getCurrentAdminUser();
  if (!current) redirect("/admin/login");

  const page = Math.max(1, Number(searchParams.page) || 1);

  const [banners, total] = await Promise.all([
    prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.banner.count(),
  ]);

  return (
    <div>
      <PageHeader
        title="Banner &amp; Slider Trang Chủ"
        subtitle="Quản lý các slide banner toàn màn hình trên trang chủ website, hỗ trợ cập nhật ảnh, link điều hướng và bật tắt hiển thị tức thì"
      />
      <BannersView
        initialBanners={banners}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}

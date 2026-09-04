import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { BannerManager } from "./BannerManager";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const current = await getCurrentAdminUser();
  if (!current) redirect("/login");

  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Banner &amp; Slider Trang Chủ"
        subtitle="Quản lý các slide banner toàn màn hình trên trang chủ website, hỗ trợ cập nhật ảnh, link điều hướng và bật tắt hiển thị tức thì"
      />
      <BannerManager initialBanners={banners} />
    </div>
  );
}

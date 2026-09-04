import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { PAGE_SLUGS, type PageSlug } from "@/lib/admin/schemas";
import { BlockList } from "./BlockList";

export const dynamic = "force-dynamic";

const PAGE_LABELS: Record<PageSlug, string> = {
  home: "Trang chủ",
  "gioi-thieu": "Giới thiệu",
  "lien-he": "Liên hệ",
  "chinh-sach": "Chính sách",
};

function isPageSlug(value: string): value is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(value);
}

export default async function PageBuilderPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const admin = await getCurrentAdminUser();
  if (!admin) redirect("/admin/login");

  const page: PageSlug = isPageSlug(searchParams.page || "") ? (searchParams.page as PageSlug) : "home";

  const blocks = await prisma.pageBlock.findMany({
    where: { page },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Xây Dựng Trang"
        subtitle="Kéo-thả sắp xếp, bật/tắt hiển thị và chỉnh nội dung các khối trên trang chủ và các trang tĩnh"
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {PAGE_SLUGS.map((slug) => (
          <a
            key={slug}
            href={`/page-builder?page=${slug}`}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              slug === page
                ? "bg-brand-forest text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:border-brand-forest/40 hover:text-brand-forest"
            }`}
          >
            {PAGE_LABELS[slug]}
          </a>
        ))}
      </div>

      <BlockList page={page} initialBlocks={JSON.parse(JSON.stringify(blocks))} />
    </div>
  );
}

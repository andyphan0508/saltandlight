import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@saltandlight/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Sparkles } from "@/components/admin/Icons";
import { PAGE_SLUGS, type PageSlug } from "@/lib/admin/schemas";
import { BlockList } from "./BlockList";

export const dynamic = "force-dynamic";

const PAGE_LABELS: Record<PageSlug, string> = {
  home: "Trang chủ",
  "gioi-thieu": "Giới thiệu",
  "lien-he": "Liên hệ",
  "chinh-sach": "Chính sách",
  "dat-theo-yeu-cau": "Đặt theo yêu cầu",
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
    <div className="space-y-6">
      <PageHeader
        title="Bố Cục Nội Dung Trang"
        subtitle="Sắp xếp thứ tự hiển thị, bật/tắt các khối nội dung trên trang chủ và trang thông tin"
        action={
          <Link
            href={`/admin/editor?page=${page}`}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-forest px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-forest/90 transition-all"
          >
            <Sparkles size={14} />
            <span>Mở trong Elementor Visual Editor</span>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {PAGE_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={`/admin/page-builder?page=${slug}`}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              slug === page
                ? "bg-brand-forest text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:border-brand-forest/40 hover:text-brand-forest"
            }`}
          >
            {PAGE_LABELS[slug]}
          </Link>
        ))}
      </div>

      <BlockList page={page} initialBlocks={JSON.parse(JSON.stringify(blocks))} />
    </div>
  );
}

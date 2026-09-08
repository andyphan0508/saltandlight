export const revalidate = 60;

import { HomeAboutIntro } from "@/components/HomeAboutIntro";
import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks, listPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

const DEFAULT_HOME_BLOCKS: PageBlockData[] = [
  {
    id: "default-seasonal-products",
    type: "FEATURED_PRODUCTS",
    content: {
      eyebrow: "Bộ sưu tập đặc biệt",
      headline: "Sản Phẩm Theo Mùa",
      sourceType: "category",
      categorySlug: "mua-giang-sinh",
      categoryName: "Mùa giáng sinh",
      ctaLabel: "Xem tất cả",
      ctaHref: "/san-pham?categories=mua-giang-sinh",
      count: 8,
      displayMode: "grid",
    },
  },
  {
    id: "default-adult-tees",
    type: "FEATURED_PRODUCTS",
    content: {
      eyebrow: "Thời trang nam nữ",
      headline: "Áo Thun Người Lớn",
      sourceType: "category",
      categorySlug: "ao-thun-nguoi-lon",
      categoryName: "Áo thun người lớn",
      ctaLabel: "Xem tất cả",
      ctaHref: "/san-pham?categories=ao-thun-nguoi-lon",
      count: 8,
      displayMode: "grid",
    },
  },
  {
    id: "default-kids-tees",
    type: "FEATURED_PRODUCTS",
    content: {
      eyebrow: "Dành cho thiếu nhi & gia đình",
      headline: "Áo Thun Trẻ Em",
      sourceType: "category",
      categorySlug: "ao-thun-cho-be",
      categoryName: "Áo thun cho bé",
      ctaLabel: "Xem tất cả",
      ctaHref: "/san-pham?categories=ao-thun-cho-be",
      count: 8,
      displayMode: "grid",
    },
  },
  {
    id: "default-other-products",
    type: "FEATURED_PRODUCTS",
    content: {
      eyebrow: "Quà tặng & Phụ kiện",
      headline: "Sản Phẩm Khác",
      sourceType: "category",
      categorySlug: "tui-tote-canvas",
      categoryName: "Túi tote canvas",
      ctaLabel: "Xem tất cả",
      ctaHref: "/san-pham?categories=tui-tote-canvas",
      count: 8,
      displayMode: "grid",
    },
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { editor?: string };
}) {
  let blocks: PageBlockData[] = [];
  try {
    const isEditor = searchParams?.editor === "1";
    const blocksData = isEditor
      ? await listPageBlocks("home")
      : await getCachedPageBlocks("home");
    blocks = toPlain(blocksData);
  } catch (err) {
    console.error("HomePage data fetching error:", err);
  }

  const effectiveBlocks = blocks && blocks.length > 0 ? blocks : DEFAULT_HOME_BLOCKS;

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      <HomeAboutIntro />
      {effectiveBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

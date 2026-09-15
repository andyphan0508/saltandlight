
import { HomeAboutIntro } from "./components/HomeAboutIntro";
import { HeroSlider } from "./components/HeroSlider";
import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedBanners, getCachedPageBlocks, listPageBlocks } from "@/server/queries";
import { toPlain } from "@/helpers/serialize";
import type { BannerData } from "@/interfaces/catalog";

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

const HomePage = async ({
  searchParams,
}: {
  searchParams?: { editor?: string };
}) => {
  let blocks: PageBlockData[] = [];
  let banners: BannerData[] = [];
  const isEditor = searchParams?.editor === "1";
  try {
    const [blocksData, bannerRows] = await Promise.all([
      isEditor ? listPageBlocks("home") : getCachedPageBlocks("home"),
      getCachedBanners(),
    ]);
    blocks = toPlain(blocksData);
    banners = toPlain(bannerRows);
  } catch (err) {
    console.error("HomePage data fetching error:", err);
  }

  const effectiveBlocks = blocks && blocks.length > 0 ? blocks : DEFAULT_HOME_BLOCKS;

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      {banners.length > 0 && <HeroSlider banners={banners} />}
      <HomeAboutIntro />
      {effectiveBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

export default HomePage;

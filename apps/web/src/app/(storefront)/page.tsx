export const dynamic = "force-dynamic";
export const revalidate = 0;

import { HeroSlider } from "@/components/HeroSlider";
import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { listBanners, getCachedPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

const DEFAULT_HOME_BLOCKS: PageBlockData[] = [
  {
    id: "default-feature-cards",
    type: "FEATURE_CARDS",
    content: {
      style: "row",
      items: [
        {
          icon: "Truck",
          title: "Đồng Giá Ship 19K",
          description: "Áp dụng toàn quốc cho mọi đơn hàng. Freeship khi đơn từ 299K.",
        },
        {
          icon: "ShieldCheck",
          title: "100% Cotton Tự Nhiên",
          description: "Sợi bông tuyển chọn, co giãn 4 chiều, mực in DTG không bong tróc.",
        },
        {
          icon: "RefreshCw",
          title: "Đổi Size 7 Ngày Tận Nơi",
          description: "Mặc không vừa đổi ngay tận nhà, đội ngũ hỗ trợ tận tâm, nhanh chóng.",
        },
        {
          icon: "Sparkles",
          title: "Tư Vấn Tận Tâm 24/7",
          description: "Đội ngũ Salt & Light sẵn sàng hỗ trợ bạn chọn size và giải đáp mọi thắc mắc.",
        },
      ],
    },
  },
  {
    id: "default-featured-products",
    type: "FEATURED_PRODUCTS",
    content: {
      eyebrow: "Được yêu thích nhất",
      headline: "Sản Phẩm Nổi Bật & Bán Chạy",
      ctaLabel: "Xem tất cả sản phẩm",
      ctaHref: "/san-pham",
      count: 8,
    },
  },
  // {
  //   id: "default-story-banner",
  //   type: "STORY_BANNER",
  //   content: {
  //     icon: "CrossIcon",
  //     quote: "Các con là muối của đất... Các con là ánh sáng của thế gian.",
  //     quoteRef: "Ma-thi-ơ 5:13-14",
  //     body: "Salt & Light ra đời với ước ao đem Lời Hằng Sống của Chúa hiện diện một cách gần gũi, chỉn chu và thẩm mỹ trong đời sống giới trẻ và cộng đồng Cơ Đốc Việt Nam. Mỗi chiếc áo, mỗi chiếc túi là một lời chứng sống động về đức tin, hy vọng và tình yêu thương.",
  //     ctaLabel: "Đọc câu chuyện của Salt & Light",
  //     ctaHref: "/gioi-thieu",
  //   },
  // },
  {
    id: "default-promo-cta",
    type: "PROMO_CTA",
    content: {
      badge: "Dành cho Hội thánh & Ban ngành",
      icon: "Gift",
      headline: "Đặt May Áo Đồng Phục & Quà Tặng Theo Yêu Cầu",
      body: "Bạn đang cần đặt áo đồng phục cho Ban Thanh Niên, Trại Hè, Lễ Phục Sinh, Giáng Sinh hoặc quà lưu niệm mang dấu ấn riêng của Hội thánh? Đội ngũ Salt & Light nhận thiết kế mẫu miễn phí và chiết khấu đặc biệt cho số lượng lớn.",
      bullets: [
        "Hỗ trợ thiết kế demo miễn phí",
        "Vải 100% Cotton mềm mát",
        "Giá ưu đãi từ 10 áo",
      ],
      ctaLabel: "Gửi yêu cầu báo giá",
      ctaHref: "/dat-theo-yeu-cau",
    },
  },
  {
    id: "default-testimonials",
    type: "TESTIMONIALS",
    content: {
      eyebrow: "Cảm nhận khách hàng",
      headline: "Tín Hữu Nói Gì Về Salt & Light?",
      items: [
        {
          name: "Tuyết Nhi",
          role: "Khách hàng tại TP.HCM",
          rating: 5,
          product: "Áo Thun FEARLESS",
          comment: "Chất vải cotton dày dặn, mặc mát và form áo đứng dáng rất đẹp. Câu Kinh Thánh in sắc nét, đi đâu mặc ai cũng khen và hỏi mua ở đâu. Rất tự hào khi mặc áo mang Lời Chúa!",
        },
        {
          name: "Mục sư Trí Dũng",
          role: "Ban Thanh Niên HT",
          rating: 5,
          product: "Áo Đồng Phục Trại Hè",
          comment: "Đặt hơn 80 áo cho kỳ trại thanh niên, các bạn trẻ thích mê. Thiết kế ý nghĩa, giao hàng đúng hẹn và đội ngũ Salt & Light hỗ trợ cực kỳ nhiệt tình, chu đáo.",
        },
        {
          name: "Khánh Linh",
          role: "Khách hàng tại Hà Nội",
          rating: 5,
          product: "Túi Tote Canvas",
          comment: "Túi vải dày dặn, quai may chắc chắn đựng được cả laptop và Kinh Thánh mang đi nhóm. Món quà tặng ý nghĩa cho bạn bè nhân dịp sinh nhật.",
        },
      ],
    },
  },
];

export default async function HomePage() {
  let banners: any[] = [];
  let blocks: PageBlockData[] = [];
  try {
    const [bannersData, blocksData] = await Promise.all([listBanners(), getCachedPageBlocks("home")]);
    banners = toPlain(bannersData);
    blocks = toPlain(blocksData);
  } catch (err) {
    console.error("HomePage data fetching error:", err);
  }

  const effectiveBlocks = blocks && blocks.length > 0 ? blocks : DEFAULT_HOME_BLOCKS;

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      <HeroSlider banners={banners} />
      {effectiveBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

/**
 * One-off backfill: copies the content that today lives hardcoded in
 * apps/web/src/app/page.tsx (post-hero sections) and the three static
 * pages (gioi-thieu, lien-he, chinh-sach) into PageBlock rows, so the
 * admin page-builder has something to manage and the storefront can be
 * cut over to rendering from the DB.
 *
 * Idempotent: each page's existing blocks are replaced wholesale, so this
 * can be re-run safely while iterating on copy.
 *
 * Usage: pnpm --filter @saltandlight/scripts seed:page-blocks
 */
import { prisma, type Prisma } from "@saltandlight/db";

type Seed = {
  page: string;
  blocks: { type: string; content: Prisma.InputJsonValue; isVisible?: boolean }[];
};

const SEEDS: Seed[] = [
  {
    page: "home",
    blocks: [
      {
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
              icon: "Heart",
              title: "Sứ Mạng & Bác Ái",
              description: "Trích 5% doanh thu đồng hành cùng các hoạt động từ thiện Cơ Đốc.",
            },
          ],
        },
      },
      {
        type: "FEATURED_PRODUCTS",
        content: {
          eyebrow: "Được yêu thích nhất",
          headline: "Sản Phẩm Nổi Bật & Bán Chạy",
          ctaLabel: "Xem tất cả sản phẩm",
          ctaHref: "/san-pham",
          count: 8,
        },
      },
      {
        type: "STORY_BANNER",
        content: {
          icon: "CrossIcon",
          quote: "Các con là muối của đất... Các con là ánh sáng của thế gian.",
          quoteRef: "Ma-thi-ơ 5:13-14",
          body: "Salt & Light ra đời với ước ao đem Lời Hằng Sống của Chúa hiện diện một cách gần gũi, chỉn chu và thẩm mỹ trong đời sống giới trẻ và cộng đồng Cơ Đốc Việt Nam. Mỗi chiếc áo, mỗi chiếc túi là một lời chứng sống động về đức tin, hy vọng và tình yêu thương.",
          ctaLabel: "Đọc câu chuyện của Salt & Light",
          ctaHref: "/gioi-thieu",
        },
      },
      {
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
              comment:
                "Vải áo siêu dày dặn nhưng mặc rất mát, form rộng vừa vặn mặc đi nhà thờ hay đi làm đều rất hợp. Mình rất thích câu gốc in sau lưng áo!",
            },
            {
              name: "Anh Tuấn",
              role: "Ban Thanh Niên - Hà Nội",
              rating: 5,
              product: "Áo Thun WALK BY FAITH",
              comment:
                "Shop đóng gói cẩn thận, có kèm thiệp cảm ơn và câu gốc rất ấm áp. Cả ban thanh niên nhóm mình đều khen áo đẹp!",
            },
            {
              name: "Thảo Vy",
              role: "Khách hàng tại Đà Nẵng",
              rating: 5,
              product: "Túi Tote FAITH OVER FEAR",
              comment:
                "Túi tote đựng vừa laptop 14 inch, vải canvas dày dặn quai may chắc chắn. Giao hàng 2 ngày là nhận được rồi, đồng giá ship 19k siêu hời.",
            },
          ],
        },
      },
    ],
  },
  {
    page: "gioi-thieu",
    blocks: [
      {
        type: "PAGE_HERO",
        content: {
          icon: "CrossIcon",
          eyebrow: "Câu Chuyện Thương Hiệu",
          title: "Muối Của Đất & Ánh Sáng Của Thế Gian",
          quote:
            "Các con là muối của đất... Các con là ánh sáng của thế gian. Một cái thành ở trên núi thì không thể bị khuất được.",
          quoteRef: "Ma-thi-ơ 5:13-14",
        },
      },
      {
        type: "FEATURE_CARDS",
        content: {
          style: "card",
          items: [
            {
              icon: "Sparkles",
              title: "Ước Mơ Khởi Nguồn",
              description:
                "Salt & Light ra đời từ một ước ao giản dị: Làm sao để Lời Chúa không chỉ nằm trong những trang Kinh Thánh hay trên bục giảng, mà có thể đồng hành cùng các bạn trẻ trong mọi khoảnh khắc cuộc sống — từ trường học, nơi làm việc, quán cà phê cho đến những chuyến đi xa.",
            },
            {
              icon: "ShieldCheck",
              title: "Chất Lượng Chỉn Chu",
              description:
                "Vì đại diện cho danh Chúa, chúng mình đặt tiêu chuẩn cao nhất cho từng sản phẩm: 100% Cotton 4 chiều mềm mịn, công nghệ in bền bỉ không nứt gãy, đường may tỉ mỉ và cách đóng gói trang trọng như một món quà từ tấm lòng.",
            },
          ],
        },
      },
      {
        type: "FEATURE_CARDS",
        content: {
          style: "numbered",
          headline: "3 Giá Trị Cốt Lõi",
          subtitle: "Kim chỉ nam trong từng sản phẩm của Salt & Light",
          items: [
            {
              number: "01.",
              title: "Chân Thật",
              description: "Trang phục mang thông điệp tích cực, chân thật từ Lời Chúa, khích lệ đức tin mỗi ngày.",
            },
            {
              number: "02.",
              title: "Xuất Sắc",
              description: "Tận tâm trong từng sợi vải, đường kim mũi chỉ, xứng đáng với tinh thần phụng sự tốt nhất.",
            },
            {
              number: "03.",
              title: "Bác Ái",
              description: "Dành 5% doanh thu sẻ chia với các hoàn cảnh khó khăn, mái ấm và quỹ phát triển Cơ Đốc.",
            },
          ],
        },
      },
      {
        type: "CTA_BANNER",
        content: {
          headline: "Cùng Salt & Light Lan Toả Đức Tin Ngay Hôm Nay",
          buttons: [
            { label: "Xem bộ sưu tập sản phẩm", href: "/san-pham", variant: "primary" },
            { label: "Liên hệ với chúng mình", href: "/lien-he", variant: "outline" },
          ],
        },
      },
    ],
  },
  {
    page: "lien-he",
    blocks: [
      {
        type: "PAGE_HERO",
        content: {
          eyebrow: "Kết nối cùng chúng mình",
          title: "Liên Hệ Với Salt & Light",
          subtitle: "Chúng mình luôn sẵn lòng lắng nghe, giải đáp thắc mắc và đồng hành cùng bạn.",
        },
      },
      {
        type: "CONTACT_INFO",
        content: {
          items: [
            {
              icon: "Phone",
              label: "Hotline & Zalo",
              value: "0847 25 2025",
              note: "8:30 - 21:00 hàng ngày",
            },
            {
              icon: "Mail",
              label: "Hộp thư Email",
              value: "saltandlight.lienhe@gmail.com",
              note: "Phản hồi trong 24h làm việc",
            },
            {
              icon: "MapPin",
              label: "Địa chỉ văn phòng",
              value: "TP. Hồ Chí Minh, Việt Nam",
              note: "Giao hàng toàn quốc",
            },
          ],
          quote: "Lòng yêu thương chẳng hề hư mất bao giờ.",
          quoteRef: "1 Cô-rinh-tô 13:8",
        },
      },
    ],
  },
  {
    page: "chinh-sach",
    blocks: [
      {
        type: "PAGE_HERO",
        content: {
          eyebrow: "Minh bạch & Tận tâm",
          title: "Chính Sách Bán Hàng & Đổi Trả",
          subtitle: "Salt & Light cam kết mang lại trải nghiệm mua sắm an tâm tuyệt đối cho quý khách hàng.",
        },
      },
      {
        type: "FEATURE_CARDS",
        content: {
          style: "card",
          items: [
            {
              icon: "RefreshCw",
              title: "Đổi Trả Trong 7 Ngày",
              description: "Hỗ trợ đổi size hoặc đổi mẫu khác trong vòng 7 ngày kể từ khi nhận hàng nếu áo chưa qua sử dụng.",
            },
            {
              icon: "Truck",
              title: "Đồng Giá Ship 19K",
              description: "Áp dụng cho mọi tỉnh thành trên toàn quốc. Đơn hàng từ 299.000₫ được miễn phí vận chuyển 100%.",
            },
            {
              icon: "ShieldCheck",
              title: "Kiểm Hàng Trước Khi Nhận",
              description: "Khách hàng được quyền mở gói hàng kiểm tra đúng mẫu, đúng màu sắc và kích thước trước khi nhận.",
            },
          ],
        },
      },
      {
        type: "RICH_TEXT_SECTIONS",
        content: {
          sections: [
            {
              heading: "1. Quy Trình Đổi Hàng Đơn Giản",
              paragraphs: ["Nếu bạn nhận áo mặc chưa vừa vặn hoặc muốn đổi sang mẫu khác:"],
              bullets: [
                "Liên hệ hotline / Zalo 0847 25 2025 hoặc nhắn tin cho Salt & Light.",
                "Cung cấp mã đơn hàng và kích cỡ bạn muốn đổi.",
                "Shipper sẽ mang áo mới đến tận nhà đổi trực tiếp và thu hồi lại áo cũ (bạn không cần phải tự mang đi gửi bưu cục).",
              ],
            },
            {
              heading: "2. Thời Gian Giao Hàng Dự Kiến",
              cards: [
                { title: "Nội thành TP. Hồ Chí Minh", description: "Giao trong 1 - 2 ngày làm việc." },
                { title: "Các tỉnh thành khác toàn quốc", description: "Giao trong 2 - 4 ngày làm việc." },
              ],
            },
            {
              heading: "3. Phương Thức Thanh Toán",
              paragraphs: ["Salt & Light hỗ trợ 2 hình thức thanh toán thuận tiện:"],
              bullets: [
                "Chuyển khoản VietQR tự động: Quét mã QR hiển thị ngay sau khi đặt hàng.",
                "Thanh toán khi nhận hàng (COD): Kiểm tra hàng rồi thanh toán tiền mặt cho shipper.",
              ],
            },
            {
              heading: "Mọi thắc mắc cần hỗ trợ, vui lòng liên hệ:",
              paragraphs: ["Hotline: 0847 25 2025 • Email: saltandlight.lienhe@gmail.com"],
              style: "note",
            },
          ],
        },
      },
    ],
  },
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  let totalBlocks = 0;

  for (const seed of SEEDS) {
    totalBlocks += seed.blocks.length;
    console.log(`\n${seed.page}: ${seed.blocks.length} block(s)`);
    seed.blocks.forEach((b, i) => console.log(`  ${i + 1}. ${b.type}`));

    if (dryRun) continue;

    await prisma.$transaction(async (tx) => {
      await tx.pageBlock.deleteMany({ where: { page: seed.page } });
      await tx.pageBlock.createMany({
        data: seed.blocks.map((b, i) => ({
          page: seed.page,
          type: b.type as never,
          sortOrder: i,
          isVisible: b.isVisible ?? true,
          content: b.content,
        })),
      });
    });
  }

  console.log(`\n${dryRun ? "[dry-run] would seed" : "Seeded"} ${totalBlocks} blocks across ${SEEDS.length} pages.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

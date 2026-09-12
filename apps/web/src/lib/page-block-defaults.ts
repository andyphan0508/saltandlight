import { prisma, type Prisma } from "@saltandlight/db";
import type { PageBlockTypeValue } from "@/lib/admin/page-block-types";
import { revalidatePageBlocks } from "@/lib/admin/page-blocks";

export interface DefaultBlockDefinition {
  type: PageBlockTypeValue;
  content: Prisma.InputJsonValue;
  isVisible?: boolean;
}

export const PAGE_DEFAULT_BLOCKS: Record<string, DefaultBlockDefinition[]> = {
  home: [
    {
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
        allowViewAll: true,
        viewAllMode: "link",
      },
    },
    {
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
        allowViewAll: true,
        viewAllMode: "link",
      },
    },
    {
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
        allowViewAll: true,
        viewAllMode: "link",
      },
    },
    {
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
        allowViewAll: true,
        viewAllMode: "link",
      },
    },
  ],
  "gioi-thieu": [
    {
      type: "PAGE_HERO",
      content: {
        icon: "CrossIcon",
        eyebrow: "Về chúng tôi",
        title: "Salt & Light",
        subtitle: "Đó cũng là lí do Salt & Light được ra đời — Mang Lời Chúa vào cuộc sống thường nhật qua thời trang Cơ Đốc chất lượng và ý nghĩa.",
        quote: "Các ngươi là sự sáng của thế gian. Một cái thành ở trên núi thì không thể khuất được.",
        quoteRef: "Ma-thi-ơ 5:14",
      },
    },
    {
      type: "FEATURE_CARDS",
      content: {
        style: "numbered",
        headline: "3 Giá Trị Cốt Lõi Của Salt & Light",
        subtitle: "Những nguyên tắc định hình sản phẩm và dịch vụ của chúng mình",
        items: [
          {
            number: "01",
            title: "Tôn Vinh Chúa",
            description: "Mọi thông điệp và thiết kế đều hướng lòng người về tình yêu thương của Chúa.",
          },
          {
            number: "02",
            title: "Chất Lượng Tận Tâm",
            description: "Chất vải 100% Cotton thoáng mát, đường may chuẩn chỉ và in sắc nét.",
          },
          {
            number: "03",
            title: "Đồng Hành Cùng Bạn",
            description: "Sẵn sàng hỗ trợ các Hội Thánh, Trại Hè và Ban Thanh Niên trên mọi nẻo đường.",
          },
        ],
      },
    },
    {
      type: "CTA_BANNER",
      content: {
        headline: "Bạn đã sẵn sàng cùng Salt & Light lan tỏa Sự Sáng?",
        buttons: [
          { label: "Khám phá sản phẩm", href: "/san-pham", variant: "primary" },
          { label: "Liên hệ chúng mình", href: "/lien-he", variant: "outline" },
        ],
      },
    },
  ],
  "lien-he": [
    {
      type: "PAGE_HERO",
      content: {
        icon: "Phone",
        eyebrow: "Kết Nối Cùng Salt & Light",
        title: "Liên Hệ Với Chúng Mình",
        subtitle: "Bạn cần tư vấn size, đặt hàng số lượng lớn cho Hội thánh, hay có bất kỳ thắc mắc nào? Đội ngũ Salt & Light luôn sẵn sàng hỗ trợ bạn.",
      },
    },
    {
      type: "CONTACT_INFO",
      content: {
        items: [
          { icon: "Phone", label: "Hotline & Zalo Tư Vấn", value: "0847 25 2025", note: "Hỗ trợ 8h00 - 21h00 hàng ngày" },
          { icon: "Mail", label: "Email Hỗ Trợ", value: "saltandlight.vn@gmail.com", note: "Phản hồi trong 24 giờ làm việc" },
          { icon: "MapPin", label: "Địa Chỉ", value: "TP. Hồ Chí Minh", note: "Giao hàng toàn quốc" },
        ],
        quote: "Hãy siêng năng mà chớ làm biếng; phải có lòng sốt sắng; phải hầu việc Chúa.",
        quoteRef: "Rô-ma 12:11",
      },
    },
    {
      type: "CTA_BANNER",
      content: {
        headline: "Cần đặt may áo đồng phục cho Ban Ngành hoặc Hội Thánh?",
        buttons: [
          { label: "Đặt may theo yêu cầu", href: "/dat-theo-yeu-cau", variant: "primary" },
          { label: "Xem sản phẩm có sẵn", href: "/san-pham", variant: "outline" },
        ],
      },
    },
  ],
  "dat-theo-yeu-cau": [
    {
      type: "PAGE_HERO",
      content: {
        icon: "Gift",
        eyebrow: "Dành Cho Hội Thánh & Nhóm Bạn",
        title: "Đặt May Áo & Quà Tặng Theo Yêu Cầu",
        subtitle:
          "Đồng phục Trại Hè, Lễ Phục Sinh, Giáng Sinh, Ban Thanh Niên, Ca Đoàn. Chất lượng vải 100% Cotton mềm mịn, bảng giá chiết khấu đặc quyền từ 10 áo.",
      },
    },
    {
      type: "FEATURE_CARDS",
      content: {
        style: "numbered",
        headline: "Quy Trình 4 Bước Đơn Giản",
        items: [
          {
            number: "01",
            title: "Tiếp nhận ý tưởng",
            description: "Gửi thông tin số lượng, ý tưởng câu gốc hoặc logo Hội thánh.",
          },
          {
            number: "02",
            title: "Thiết kế Demo",
            description: "Đội ngũ Salt & Light lên market mẫu 2D/3D miễn phí cho bạn duyệt.",
          },
          {
            number: "03",
            title: "Sản xuất & Kiểm tra",
            description: "Cắt may vải 100% cotton, in DTG/lụa cao cấp chuẩn nét từng chi tiết.",
          },
          {
            number: "04",
            title: "Giao hàng tận nơi",
            description: "Đóng gói theo từng size cá nhân và giao hàng toàn quốc đúng hẹn.",
          },
        ],
      },
    },
  ],
  "chinh-sach": [
    {
      type: "PAGE_HERO",
      content: {
        eyebrow: "Minh bạch & Tận tâm",
        title: "Chính Sách Bán Hàng & Đổi Trả",
        subtitle:
          "Salt & Light cam kết mang lại trải nghiệm mua sắm an tâm tuyệt đối cho quý khách hàng.",
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
            description:
              "Hỗ trợ đổi size hoặc đổi mẫu khác trong vòng 7 ngày kể từ khi nhận hàng nếu áo chưa qua sử dụng.",
          },
          {
            icon: "Truck",
            title: "Đồng Giá Ship 19K Toàn Quốc",
            description:
              "Áp dụng cho mọi tỉnh thành trên toàn quốc. Đơn hàng từ 299.000₫ được miễn phí vận chuyển 100%.",
          },
          {
            icon: "ShieldCheck",
            title: "Kiểm Hàng Trước Khi Nhận",
            description:
              "Khách hàng được quyền mở gói hàng kiểm tra đúng mẫu, đúng màu sắc và kích thước trước khi nhận.",
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
};

/**
 * Ensures blocks exist for a page. If the page is completely empty and defaults exist,
 * automatically seeds them into the database and returns them.
 */
export async function getOrSeedPageBlocks(page: string) {
  const existing = await prisma.pageBlock.findMany({
    where: { page },
    orderBy: { sortOrder: "asc" },
  });

  if (existing.length > 0) {
    return existing;
  }

  const defaults = PAGE_DEFAULT_BLOCKS[page];
  if (!defaults || defaults.length === 0) {
    return [];
  }

  // Seed default blocks into DB
  const created = await prisma.$transaction(
    defaults.map((d, index) =>
      prisma.pageBlock.create({
        data: {
          page,
          type: d.type as never,
          sortOrder: index,
          isVisible: d.isVisible ?? true,
          content: d.content,
        },
      })
    )
  );

  try {
    revalidatePageBlocks(page);
  } catch (err) {
    console.error("Failed to revalidate page blocks cache:", err);
  }

  return created;
}

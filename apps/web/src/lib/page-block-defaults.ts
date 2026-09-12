import { prisma, type Prisma } from "@saltandlight/db";
import type { PageBlockTypeValue } from "@/lib/admin/page-block-types";
import { revalidatePageBlocks } from "@/lib/admin/page-blocks";

export interface DefaultBlockDefinition {
  type: PageBlockTypeValue;
  content: Prisma.InputJsonValue;
  isVisible?: boolean;
}

export const PAGE_DEFAULT_BLOCKS: Record<string, DefaultBlockDefinition[]> = {
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

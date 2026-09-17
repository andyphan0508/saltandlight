import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks, listPageBlocks } from "@/server/queries";
import { toPlain } from "@/helpers/serialize";
import { CUSTOM_ORDER_FORM_CONTENT } from "@/helpers/page-block-seeds";

export const metadata = {
  title: "Đặt may & in theo yêu cầu · Salt & Light",
  description: "Dịch vụ thiết kế và may áo đồng phục Cơ Đốc cho Ban Thanh Niên, Trại Hè, Hội Thánh.",
};

const DEFAULT_CUSTOM_ORDER_BLOCKS: PageBlockData[] = [
  {
    id: "default-custom-order-hero",
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
    id: "default-custom-order-steps",
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
  { id: "default-custom-order-form", type: "CONTACT_FORM", content: CUSTOM_ORDER_FORM_CONTENT },
];

const CustomOrderPage = async ({
  searchParams,
}: {
  searchParams?: { editor?: string };
}) => {
  let blocks: PageBlockData[] = [];
  const isEditor = searchParams?.editor === "1";
  try {
    const fetched = isEditor
      ? await listPageBlocks("dat-theo-yeu-cau")
      : await getCachedPageBlocks("dat-theo-yeu-cau");
    blocks = toPlain(fetched);
  } catch (err) {
    console.error("CustomOrderPage data fetching error:", err);
  }

  const effectiveBlocks = blocks && blocks.length > 0 ? blocks : DEFAULT_CUSTOM_ORDER_BLOCKS;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-16 animate-slide-up-fade">
      {/* Every section, including the quote form, is a page block editable in the Live Editor */}
      {effectiveBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

export default CustomOrderPage;

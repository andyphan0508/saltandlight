import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export const metadata = {
  title: "Chính sách đổi trả & Giao hàng · Salt & Light",
  description: "Chính sách đổi size trong 7 ngày, biểu phí đồng giá ship 19K và bảng quy đổi size tại Salt & Light.",
};

export const revalidate = 60;

const DEFAULT_POLICY_BLOCKS: PageBlockData[] = [
  {
    id: "default-policy-hero",
    type: "PAGE_HERO",
    content: {
      eyebrow: "Quyền lợi khách hàng",
      headline: "Chính Sách Đổi Trả & Giao Nhận",
      subheadline: "Salt & Light luôn cam kết đồng hành và mang đến trải nghiệm mua sắm an tâm nhất cho bạn và gia đình.",
    },
  },
  {
    id: "default-policy-cards",
    type: "FEATURE_CARDS",
    content: {
      style: "grid",
      items: [
        {
          icon: "RefreshCw",
          title: "Đổi Size Tận Nơi 7 Ngày",
          description: "Mặc không vừa hoặc muốn đổi màu/mẫu khác? Salt & Light hỗ trợ đổi hàng tận nhà trong 7 ngày, shipper mang áo mới đến và thu áo cũ về cùng lúc.",
        },
        {
          icon: "Truck",
          title: "Đồng Giá Ship 19K Toàn Quốc",
          description: "Áp dụng cho mọi tỉnh thành từ Bắc chí Nam. Đặc biệt, miễn phí vận chuyển 100% cho mọi đơn hàng có giá trị từ 299.000đ.",
        },
        {
          icon: "ShieldCheck",
          title: "Kiểm Tra Trước Khi Thanh Toán",
          description: "Bạn luôn được quyền mở gói hàng kiểm tra chất vải, đường may, hình in trước khi thanh toán tiền cho nhân viên giao hàng.",
        },
        {
          icon: "Sparkles",
          title: "Bảo Hành Hình In 30 Ngày",
          description: "Cam kết mực in kỹ thuật số DTG cao cấp. Đổi mới 1-1 nếu hình in bị bong tróc, nứt gãy hoặc lỗi kỹ thuật từ nhà sản xuất.",
        },
      ],
    },
  },
];

export default async function PolicyPage() {
  let blocks: PageBlockData[] = [];
  try {
    blocks = toPlain(await getCachedPageBlocks("chinh-sach"));
  } catch (err) {
    console.error("PolicyPage data fetching error:", err);
  }

  const effectiveBlocks = blocks && blocks.length > 0 ? blocks : DEFAULT_POLICY_BLOCKS;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-12 animate-slide-up-fade">
      {effectiveBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

import { ContactForm } from "@/components/ContactForm";
import { Check, Phone } from "@/components/Icons";
import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks, listPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export const metadata = {
  title: "Đặt may & in theo yêu cầu · Salt & Light",
  description: "Dịch vụ thiết kế và may áo đồng phục Cơ Đốc cho Ban Thanh Niên, Trại Hè, Hội Thánh.",
};

export const revalidate = 60;

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
];

export default async function CustomOrderPage({
  searchParams,
}: {
  searchParams?: { editor?: string };
}) {
  let blocks: PageBlockData[] = [];
  try {
    const isEditor = searchParams?.editor === "1";
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
      {/* CMS Blocks (Hero, Steps, etc.) */}
      {effectiveBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}

      {/* Form Container */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-4">
            <h3 className="font-display text-base font-black uppercase text-ink">
              Cam Kết Từ Salt &amp; Light
            </h3>
            <ul className="space-y-3 text-xs text-ink/75">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Thiết kế demo miễn phí đến khi bạn hài lòng.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Chất vải 100% Cotton 4 chiều không phai, không xù.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Đa dạng form size: Trẻ em, Nam, Nữ, Oversize.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Chiết khấu trực tiếp lên đến 25% cho số lượng lớn.</span>
              </li>
            </ul>

            <div className="border-t border-ink/10 pt-4 flex items-center gap-2 text-xs text-brand-forest font-bold">
              <Phone size={16} />
              <span>Tư vấn trực tiếp: 0847 25 2025</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-7">
          <h2 className="font-display text-base font-black uppercase text-ink mb-6">
            Gửi Thông Tin Yêu Cầu Báo Giá
          </h2>
          <ContactForm type="custom_order" />
        </div>
      </div>
    </div>
  );
}

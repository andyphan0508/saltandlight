"use client";

import { X, Sparkles, Plus } from "./Icons";
import {
  PAGE_BLOCK_TYPES,
  type PageBlockTypeValue,
} from "@/lib/admin/page-block-types";

export interface BlockTemplateMeta {
  type: PageBlockTypeValue;
  title: string;
  badge?: string;
  category: "Sản phẩm" | "Thương hiệu" | "Bán hàng & Chuyển đổi" | "Thông tin";
  iconEmoji: string;
  description: string;
  example: string;
}

export const BLOCK_TEMPLATES: BlockTemplateMeta[] = [
  {
    type: "PRODUCT_LIST",
    title: "Danh sách sản phẩm theo mùa / danh mục",
    badge: "Mới & Khuyên dùng",
    category: "Sản phẩm",
    iconEmoji: "🛍️",
    description: "Hiển thị sản phẩm theo một danh mục cụ thể hoặc bộ sưu tập mùa lễ. Hỗ trợ dạng lưới hoặc thanh trượt mượt mà.",
    example: "VD: Bộ sưu tập Giáng sinh, Áo thun mùa hè...",
  },
  {
    type: "FEATURED_PRODUCTS",
    title: "Sản phẩm nổi bật / Bán chạy nhất",
    badge: "Bán chạy",
    category: "Sản phẩm",
    iconEmoji: "⭐",
    description: "Tự động lấy danh sách sản phẩm bán chạy nhất hoặc các sản phẩm bạn tích chọn thủ công để khách hàng dễ mua.",
    example: "VD: Top sản phẩm bán chạy tháng này...",
  },
  {
    type: "FEATURE_CARDS",
    title: "Khung tiện ích & cam kết mua sắm",
    badge: "Tạo niềm tin",
    category: "Bán hàng & Chuyển đổi",
    iconEmoji: "✨",
    description: "Hiển thị 3-4 tiện ích mua sắm như đồng giá ship 19K, kiểm hàng COD, đổi size miễn phí 7 ngày.",
    example: "VD: Cam kết chất lượng, bảo hành...",
  },
  {
    type: "STORY_BANNER",
    title: "Khung câu chuyện & Trích dẫn Lời Chúa",
    badge: "Đặc trưng",
    category: "Thương hiệu",
    iconEmoji: "✝️",
    description: "Khung chia sẻ câu chuyện nguồn cảm hứng thương hiệu và lời dạy Kinh Thánh ý nghĩa.",
    example: "VD: Ma-thi-ơ 5:13-14, Câu chuyện Salt & Light...",
  },
  {
    type: "PROMO_CTA",
    title: "Khung ưu đãi & Đặt in theo yêu cầu",
    badge: "Dịch vụ B2B",
    category: "Bán hàng & Chuyển đổi",
    iconEmoji: "🎁",
    description: "Khung giới thiệu dịch vụ in áo theo yêu cầu cho hội thánh, gia đình, nhóm bạn trẻ, ban hát.",
    example: "VD: Đặt may áo nhóm, quà tặng mùa lễ...",
  },
  {
    type: "TESTIMONIALS",
    title: "Đánh giá & Cảm nhận khách hàng",
    badge: "Bằng chứng xã hội",
    category: "Thương hiệu",
    iconEmoji: "💬",
    description: "Hiển thị nhận xét, đánh giá 5 sao từ những khách hàng đã mua sản phẩm để tăng tỷ lệ chốt đơn.",
    example: "VD: Cảm nhận từ Hội thánh, các bạn trẻ...",
  },
  {
    type: "PAGE_HERO",
    title: "Phần mở đầu trang (Tiêu đề lớn & Lời chào)",
    category: "Thông tin",
    iconEmoji: "🏷️",
    description: "Banner mở đầu trang với tiêu đề to, lời trích dẫn truyền cảm hứng và lời giới thiệu ngắn.",
    example: "VD: Giới thiệu về Salt & Light...",
  },
  {
    type: "RICH_TEXT_SECTIONS",
    title: "Bài viết chi tiết nhiều phần",
    category: "Thông tin",
    iconEmoji: "📝",
    description: "Khối bài viết dài chia thành nhiều mục con, có gạch đầu dòng và ô thông tin trực quan.",
    example: "VD: Tầm nhìn & Sứ mệnh, Quy trình sản xuất...",
  },
  {
    type: "CONTACT_INFO",
    title: "Thông tin liên hệ (Hotline, Zalo, Địa chỉ)",
    category: "Thông tin",
    iconEmoji: "📞",
    description: "Danh sách các kênh liên hệ nhanh như Hotline, Zalo tư vấn, Email và địa chỉ cửa hàng.",
    example: "VD: Kênh hỗ trợ khách hàng...",
  },
  {
    type: "CTA_BANNER",
    title: "Khung kêu gọi mua sắm ngay",
    badge: "Tăng đơn hàng",
    category: "Bán hàng & Chuyển đổi",
    iconEmoji: "🚀",
    description: "Dải banner nổi bật kêu gọi hành động với các nút bấm dẫn thẳng tới cửa hàng hoặc trang liên hệ.",
    example: "VD: Khám phá ngay bộ sưu tập mới...",
  },
];

export function BlockPaletteModal({
  isOpen,
  targetIndex,
  onClose,
  onSelectBlock,
}: {
  isOpen: boolean;
  targetIndex?: number | null;
  onClose: () => void;
  onSelectBlock: (type: PageBlockTypeValue, targetIndex?: number | null) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-pop-in flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles size={18} className="text-brand-forest" />
              <span>Thư Viện Khối Giao Diện Mẫu (Block Library)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {typeof targetIndex === "number"
                ? `Chọn khối bạn muốn chèn vào vị trí số ${targetIndex + 1}`
                : "Chọn một khối mẫu trực quan bên dưới để thêm vào trang web của bạn"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/40">
          {BLOCK_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.type}
              onClick={() => {
                onSelectBlock(tmpl.type, targetIndex);
                onClose();
              }}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-brand-forest hover:shadow-md hover:bg-mint-50/30 transition-all text-left"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl flex-shrink-0">{tmpl.iconEmoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tmpl.category}
                    </span>
                  </div>
                  {tmpl.badge && (
                    <span className="rounded-full bg-mint-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-forest">
                      {tmpl.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-forest transition-colors">
                  {tmpl.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 italic truncate max-w-[200px]">
                  {tmpl.example}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest group-hover:underline">
                  <Plus size={13} /> Thêm khối này
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-500">
            💡 Sau khi thêm, bạn có thể chỉnh sửa nội dung chi tiết hoặc kéo đổi vị trí bất cứ lúc nào.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

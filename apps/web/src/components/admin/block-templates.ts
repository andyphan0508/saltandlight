import type { ComponentType } from "react";
import {
  Sparkles,
  ShoppingBag,
  Star,
  Gift,
  CrossIcon,
  MessageSquare,
  Layers,
  FileText,
  Phone,
  Rocket,
  type IconProps,
} from "./Icons";
import {
  PAGE_BLOCK_TYPES,
  type PageBlockTypeValue,
} from "@/lib/admin/page-block-types";

/** Block library shown in the Live Editor's "Thêm khối" tab. */
export interface BlockTemplateMeta {
  type: PageBlockTypeValue;
  title: string;
  badge?: string;
  category: "Sản phẩm" | "Thương hiệu" | "Bán hàng & Chuyển đổi" | "Thông tin";
  icon: ComponentType<IconProps>;
  iconBg: string;
  iconColor: string;
  description: string;
  example: string;
}

export const BLOCK_TEMPLATES: BlockTemplateMeta[] = [
  {
    type: "PRODUCT_LIST",
    title: "Danh sách sản phẩm theo mùa / danh mục",
    badge: "Mới & Khuyên dùng",
    category: "Sản phẩm",
    icon: ShoppingBag,
    iconBg: "bg-emerald-100/80 border border-emerald-200/70",
    iconColor: "text-emerald-700",
    description: "Hiển thị sản phẩm theo một danh mục cụ thể hoặc bộ sưu tập mùa lễ. Hỗ trợ dạng lưới hoặc thanh trượt mượt mà.",
    example: "VD: Bộ sưu tập Giáng sinh, Áo thun mùa hè...",
  },
  {
    type: "FEATURED_PRODUCTS",
    title: "Sản phẩm nổi bật / Bán chạy nhất",
    badge: "Bán chạy",
    category: "Sản phẩm",
    icon: Star,
    iconBg: "bg-amber-100/80 border border-amber-200/70",
    iconColor: "text-amber-600",
    description: "Tự động lấy danh sách sản phẩm bán chạy nhất hoặc các sản phẩm bạn tích chọn thủ công để khách hàng dễ mua.",
    example: "VD: Top sản phẩm bán chạy tháng này...",
  },
  {
    type: "FEATURE_CARDS",
    title: "Khung tiện ích & cam kết mua sắm",
    badge: "Tạo niềm tin",
    category: "Bán hàng & Chuyển đổi",
    icon: Sparkles,
    iconBg: "bg-violet-100/80 border border-violet-200/70",
    iconColor: "text-violet-600",
    description: "Hiển thị 3-4 tiện ích mua sắm như đồng giá ship 19K, kiểm hàng COD, đổi size miễn phí 7 ngày.",
    example: "VD: Cam kết chất lượng, bảo hành...",
  },
  {
    type: "STORY_BANNER",
    title: "Khung câu chuyện & Trích dẫn Lời Chúa",
    badge: "Đặc trưng",
    category: "Thương hiệu",
    icon: CrossIcon,
    iconBg: "bg-rose-100/80 border border-rose-200/70",
    iconColor: "text-rose-600",
    description: "Khung chia sẻ câu chuyện nguồn cảm hứng thương hiệu và lời dạy Kinh Thánh ý nghĩa.",
    example: "VD: Ma-thi-ơ 5:13-14, Câu chuyện Salt & Light...",
  },
  {
    type: "PROMO_CTA",
    title: "Khung ưu đãi & Đặt in theo yêu cầu",
    badge: "Dịch vụ B2B",
    category: "Bán hàng & Chuyển đổi",
    icon: Gift,
    iconBg: "bg-orange-100/80 border border-orange-200/70",
    iconColor: "text-orange-600",
    description: "Khung giới thiệu dịch vụ in áo theo yêu cầu cho hội thánh, gia đình, nhóm bạn trẻ, ban hát.",
    example: "VD: Đặt may áo nhóm, quà tặng mùa lễ...",
  },
  {
    type: "TESTIMONIALS",
    title: "Đánh giá & Cảm nhận khách hàng",
    badge: "Bằng chứng xã hội",
    category: "Thương hiệu",
    icon: MessageSquare,
    iconBg: "bg-sky-100/80 border border-sky-200/70",
    iconColor: "text-sky-600",
    description: "Hiển thị nhận xét, đánh giá 5 sao từ những khách hàng đã mua sản phẩm để tăng tỷ lệ chốt đơn.",
    example: "VD: Cảm nhận từ Hội thánh, các bạn trẻ...",
  },
  {
    type: "PAGE_HERO",
    title: "Phần mở đầu trang (Tiêu đề lớn & Lời chào)",
    category: "Thông tin",
    icon: Layers,
    iconBg: "bg-indigo-100/80 border border-indigo-200/70",
    iconColor: "text-indigo-600",
    description: "Banner mở đầu trang với tiêu đề to, lời trích dẫn truyền cảm hứng và lời giới thiệu ngắn.",
    example: "VD: Giới thiệu về Salt & Light...",
  },
  {
    type: "RICH_TEXT_SECTIONS",
    title: "Bài viết chi tiết nhiều phần",
    category: "Thông tin",
    icon: FileText,
    iconBg: "bg-slate-100 border border-slate-200",
    iconColor: "text-slate-700",
    description: "Khối bài viết dài chia thành nhiều mục con, có gạch đầu dòng và ô thông tin trực quan.",
    example: "VD: Tầm nhìn & Sứ mệnh, Quy trình sản xuất...",
  },
  {
    type: "CONTACT_INFO",
    title: "Thông tin liên hệ (Hotline, Zalo, Địa chỉ)",
    category: "Thông tin",
    icon: Phone,
    iconBg: "bg-teal-100/80 border border-teal-200/70",
    iconColor: "text-teal-700",
    description: "Danh sách các kênh liên hệ nhanh như Hotline, Zalo tư vấn, Email và địa chỉ cửa hàng.",
    example: "VD: Kênh hỗ trợ khách hàng...",
  },
  {
    type: "CTA_BANNER",
    title: "Khung kêu gọi mua sắm ngay",
    badge: "Tăng đơn hàng",
    category: "Bán hàng & Chuyển đổi",
    icon: Rocket,
    iconBg: "bg-brand-forest/10 border border-brand-forest/20",
    iconColor: "text-brand-forest",
    description: "Dải banner nổi bật kêu gọi hành động với các nút bấm dẫn thẳng tới cửa hàng hoặc trang liên hệ.",
    example: "VD: Khám phá ngay bộ sưu tập mới...",
  },
];

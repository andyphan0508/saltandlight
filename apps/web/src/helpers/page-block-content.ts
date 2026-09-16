import type { PageBlockTypeValue } from "@/interfaces/page-block";

/** Starter content for a newly added block of each type. */
export const defaultContent = (type: PageBlockTypeValue): Record<string, any> => {
  switch (type) {
    case "FEATURE_CARDS":
      return {
        style: "card",
        headline: "Cam kết & Tiện ích mua sắm",
        subtitle: "Những đặc quyền dành riêng cho khách hàng của Salt & Light",
        items: [
          {
            icon: "Truck",
            number: "01",
            title: "Đồng Giá Ship 19K Toàn Quốc",
            description: "Giao hàng tận nơi mọi miền đất nước, kiểm hàng trước khi thanh toán COD.",
          },
          {
            icon: "RefreshCw",
            number: "02",
            title: "Đổi Size Miễn Phí 7 Ngày",
            description: "Hỗ trợ đổi size tận nhà nhanh chóng nếu mặc chưa vừa vặn.",
          },
          {
            icon: "ShieldCheck",
            number: "03",
            title: "Chất Liệu Cao Cấp",
            description: "100% Cotton mềm mịn, thoáng khí và an toàn cho làn da.",
          },
        ],
      };
    case "FEATURED_PRODUCTS":
      return {
        eyebrow: "Bán chạy nhất",
        headline: "Sản phẩm nổi bật",
        ctaLabel: "Xem tất cả",
        ctaHref: "/san-pham",
        count: 8,
        sourceType: "all",
        categoryId: null,
        categorySlug: "",
        categoryName: "",
        productIds: [],
        displayMode: "grid",
        columns: "4",
        media: { slides: [], effect: "none", isAutoplay: false, intervalMs: 5000, hasDots: true, hasArrows: true },
        imageUrl: "",
        allowViewAll: true,
        viewAllMode: "link",
      };
    case "PRODUCT_LIST":
      return {
        eyebrow: "Bộ sưu tập",
        headline: "Danh sách sản phẩm mới",
        ctaLabel: "Xem tất cả sản phẩm",
        ctaHref: "/san-pham",
        count: 8,
        sourceType: "all",
        categoryId: null,
        categorySlug: "",
        categoryName: "",
        productIds: [],
        displayMode: "grid",
        columns: "4",
        media: { slides: [], effect: "none", isAutoplay: false, intervalMs: 5000, hasDots: true, hasArrows: true },
        imageUrl: "",
        allowViewAll: true,
        viewAllMode: "modal",
      };
    case "STORY_BANNER":
      return {
        icon: "CrossIcon",
        quote: "Các ngươi là sự sáng của thế gian. Một cái thành ở trên núi thì không thể khuất được.",
        quoteRef: "Ma-thi-ơ 5:14",
        body: "Salt & Light được hình thành với sứ mệnh lan tỏa Lời Chúa và những thông điệp yêu thương qua từng sản phẩm đời sống hàng ngày.",
        ctaLabel: "Về Salt & Light",
        ctaHref: "/gioi-thieu",
      };
    case "PROMO_CTA":
      return {
        badge: "Dịch vụ B2B & Hội thánh",
        icon: "Gift",
        headline: "Đặt may áo nhóm & quà tặng theo yêu cầu",
        body: "Chuyên cung cấp đồng phục Cơ Đốc cho Trại Hè, Ban Thanh Niên, Ca Đoàn và Hội Thánh với chiết khấu tốt từ 10 áo.",
        bullets: [
          "Miễn phí thiết kế demo 2D/3D theo yêu cầu",
          "Chất vải 100% Cotton mềm mại, co giãn tốt",
          "Giao hàng đúng hẹn toàn quốc",
        ],
        ctaLabel: "Liên hệ tư vấn ngay",
        ctaHref: "/dat-theo-yeu-cau",
      };
    case "TESTIMONIALS":
      return {
        eyebrow: "Bằng chứng niềm tin",
        headline: "Khách hàng nói gì về Salt & Light",
        items: [
          {
            name: "Nguyễn Minh",
            role: "Trưởng ban Thanh Niên",
            rating: 5,
            product: "Áo thun Lời Chúa",
            comment: "Chất lượng áo rất tốt, form dáng chuẩn và vải mát. Cả ban thanh niên ai cũng khen khi nhận áo!",
          },
          {
            name: "Trần Mai Anh",
            role: "Hội thánh Tin Lành",
            rating: 5,
            product: "Túi Tote & Áo Polo",
            comment: "Giao hàng nhanh, đóng gói chỉn chu, câu gốc in sắc nét. Sẽ tiếp tục ủng hộ Salt & Light.",
          },
        ],
      };
    case "PAGE_HERO":
      return {
        icon: "Sparkles",
        eyebrow: "Chào mừng đến với Salt & Light",
        title: "Tiêu đề trang mới",
        subtitle: "Mô tả ngắn gọn giới thiệu mục đích và giá trị của trang này đến khách hàng.",
        quote: "Sự sáng các ngươi hãy soi trước mặt người ta như vậy.",
        quoteRef: "Ma-thi-ơ 5:16",
      };
    case "RICH_TEXT_SECTIONS":
      return {
        sections: [
          {
            heading: "Thông tin chi tiết",
            paragraphs: [
              "Salt & Light cam kết mang lại sản phẩm chất lượng cao cùng trải nghiệm mua sắm tận tâm và minh bạch nhất.",
            ],
            bullets: ["Cam kết chính hãng 100%", "Hỗ trợ tư vấn tận tình 24/7"],
            cards: [
              {
                title: "Hỗ trợ khách hàng",
                description: "Đội ngũ luôn sẵn sàng giải đáp mọi thắc mắc qua Hotline và Zalo.",
              },
            ],
          },
        ],
      };
    case "CONTACT_INFO":
      return {
        items: [
          { icon: "Phone", label: "Hotline / Zalo", value: "0847 25 2025", note: "Hỗ trợ 8h00 - 21h00 hàng ngày" },
          { icon: "Mail", label: "Email liên hệ", value: "saltandlight.lienhe@gmail.com", note: "Phản hồi trong 24 giờ làm việc" },
          { icon: "MapPin", label: "Địa chỉ", value: "TP. Hồ Chí Minh", note: "Giao hàng toàn quốc" },
        ],
        quote: "Hãy siêng năng mà chớ làm biếng; phải có lòng sốt sắng; phải hầu việc Chúa.",
        quoteRef: "Rô-ma 12:11",
      };
    case "CTA_BANNER":
      return {
        headline: "Sẵn sàng lan tỏa Lời Chúa cùng Salt & Light?",
        buttons: [
          { label: "Khám phá sản phẩm", href: "/san-pham", variant: "primary" },
          { label: "Đặt in theo yêu cầu", href: "/dat-theo-yeu-cau", variant: "outline" },
        ],
      };
  }
};

/** Trims text fields and drops empty list entries before a block is saved. */
export const sanitizeBlockContent = (type: PageBlockTypeValue, raw: Record<string, any>): Record<string, any> => {
  const content = { ...raw };
  if (type === "RICH_TEXT_SECTIONS" && Array.isArray(content.sections)) {
    content.sections = content.sections.map((sec: any) => ({
      ...sec,
      heading: (sec.heading || "").trim(),
      paragraphs: (sec.paragraphs || []).map((p: any) => String(p).trim()).filter(Boolean),
      bullets: (sec.bullets || []).map((b: any) => String(b).trim()).filter(Boolean),
      cards: (sec.cards || [])
        .filter((c: any) => c && (c.title?.trim() || c.description?.trim()))
        .map((c: any) => ({
          title: (c.title || "").trim(),
          description: (c.description || "").trim(),
        })),
    }));
  }
  if (type === "PROMO_CTA" && Array.isArray(content.bullets)) {
    content.bullets = content.bullets.map((b: any) => String(b).trim()).filter(Boolean);
  }
  if (type === "FEATURE_CARDS" && Array.isArray(content.items)) {
    content.items = content.items.map((it: any) => ({
      ...it,
      title: (it.title || "").trim(),
      description: (it.description || "").trim(),
    }));
  }
  if (type === "CTA_BANNER" && Array.isArray(content.buttons)) {
    content.buttons = content.buttons.map((btn: any) => ({
      ...btn,
      label: (btn.label || "").trim(),
      href: (btn.href || "").trim(),
    }));
  }
  if (type === "CONTACT_INFO" && Array.isArray(content.items)) {
    content.items = content.items.map((it: any) => ({
      ...it,
      label: (it.label || "").trim(),
      value: (it.value || "").trim(),
    }));
  }
  return content;
};

/** Returns the first Vietnamese validation message for a block's content, or null when it can be saved. */
export const validateBlockContent = (type: PageBlockTypeValue, content: Record<string, any>): string | null => {
  switch (type) {
    case "PAGE_HERO":
      if (!content.title?.trim()) return "Vui lòng nhập tiêu đề lớn của trang";
      break;
    case "FEATURE_CARDS":
      if (!Array.isArray(content.items) || content.items.length === 0) {
        return "Vui lòng thêm ít nhất 1 mục tiện ích / cam kết";
      }
      for (let i = 0; i < content.items.length; i++) {
        const item = content.items[i];
        if (!item.title?.trim()) return `Mục số ${i + 1} chưa có tiêu đề`;
        if (!item.description?.trim()) return `Mục số ${i + 1} chưa có nội dung mô tả`;
      }
      break;
    case "FEATURED_PRODUCTS":
    case "PRODUCT_LIST":
      if (!content.headline?.trim()) return "Vui lòng nhập tiêu đề chính của khối";
      if (content.sourceType === "manual" && (!Array.isArray(content.productIds) || content.productIds.length === 0)) {
        return "Vui lòng chọn ít nhất 1 sản phẩm từ danh sách";
      }
      break;
    case "STORY_BANNER":
      if (!content.quote?.trim()) return "Vui lòng nhập câu trích dẫn hoặc thông điệp ý nghĩa";
      if (!content.body?.trim()) return "Vui lòng nhập nội dung câu chuyện / giới thiệu chi tiết";
      break;
    case "PROMO_CTA":
      if (!content.headline?.trim()) return "Vui lòng nhập tiêu đề thông điệp";
      if (!content.body?.trim()) return "Vui lòng nhập nội dung mô tả chương trình";
      if (!content.ctaLabel?.trim()) return "Vui lòng nhập chữ trên nút bấm";
      if (!content.ctaHref?.trim()) return "Vui lòng nhập đường dẫn khi bấm nút";
      break;
    case "TESTIMONIALS":
      if (!content.headline?.trim()) return "Vui lòng nhập tiêu đề chính của khối cảm nhận";
      if (!Array.isArray(content.items) || content.items.length === 0) {
        return "Vui lòng thêm ít nhất 1 nhận xét của khách hàng";
      }
      for (let i = 0; i < content.items.length; i++) {
        const rev = content.items[i];
        if (!rev.name?.trim()) return `Đánh giá số ${i + 1} chưa có họ tên khách hàng`;
        if (!rev.comment?.trim()) return `Đánh giá số ${i + 1} chưa có nội dung nhận xét`;
      }
      break;
    case "RICH_TEXT_SECTIONS":
      if (!Array.isArray(content.sections) || content.sections.length === 0) {
        return "Vui lòng thêm ít nhất 1 phần nội dung";
      }
      for (let i = 0; i < content.sections.length; i++) {
        if (!content.sections[i].heading?.trim()) return `Phần số ${i + 1} chưa có tiêu đề`;
      }
      break;
    case "CONTACT_INFO":
      if (!Array.isArray(content.items) || content.items.length === 0) {
        return "Vui lòng thêm ít nhất 1 kênh thông tin liên hệ";
      }
      for (let i = 0; i < content.items.length; i++) {
        const it = content.items[i];
        if (!it.label?.trim()) return `Kênh số ${i + 1} chưa có tên thông tin (Ví dụ: Hotline)`;
        if (!it.value?.trim()) return `Kênh số ${i + 1} chưa có nội dung hiển thị (Ví dụ: 0912...)`;
      }
      break;
    case "CTA_BANNER":
      if (!content.headline?.trim()) return "Vui lòng nhập tiêu đề lời kêu gọi mua sắm";
      if (!Array.isArray(content.buttons) || content.buttons.length === 0) {
        return "Vui lòng thêm ít nhất 1 nút hành động";
      }
      for (let i = 0; i < content.buttons.length; i++) {
        const btn = content.buttons[i];
        if (!btn.label?.trim()) return `Nút số ${i + 1} chưa có chữ hiển thị`;
        if (!btn.href?.trim()) return `Nút số ${i + 1} chưa có đường dẫn liên kết`;
      }
      break;
  }
  return null;
};

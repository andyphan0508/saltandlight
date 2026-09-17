/**
 * Content of the page sections that used to be hardcoded in the page screens.
 * They are now ordinary page blocks; these constants are the starting content
 * for the migration that created them, the "reset to default" seeding and the
 * fallback a page shows before it has any blocks — one copy for all three.
 */

const BRAND_STORY_BODY =
  "Chúng mình mong muốn mang đến những sản phẩm Cơ Đốc chất lượng, đa dạng mẫu mã, giá thành phải chăng, và quan trọng hơn hết là có tính ứng dụng cao để bạn có thể dễ dàng sử dụng ở mọi nơi... Đó cũng là cách chúng mình sống như “muối” và “ánh sáng” cho Chúa, lan toả tình yêu của Ngài đến mọi người!";

export const HOME_INTRO_CONTENT = {
  palette: "warm",
  emblemUrl: "/images/logo-emblem.webp",
  eyebrow: "Áo thun lời Chúa - Salt and Light",
  headline: "Giới thiệu",
  body: BRAND_STORY_BODY,
  imageUrl: "",
  imageAlt: "Salt & Light",
  buttons: [],
};

export const ABOUT_STORY_CONTENT = {
  palette: "forest",
  emblemUrl: "",
  eyebrow: "‘Áo Câu Gốc Thì Chắc Chỉ Mặc Đi Trại Được Thôi?’",
  headline: "Đó Cũng Là Lí Do Salt & Light Được Ra Đời...",
  body: BRAND_STORY_BODY,
  imageUrl: "/images/about-story.webp",
  imageAlt: "Salt & Light - Áo thun câu gốc Cơ Đốc",
  buttons: [
    { label: "Khám phá sản phẩm", href: "/san-pham", variant: "primary" },
    { label: "Liên hệ chúng mình", href: "/lien-he", variant: "outline" },
  ],
};

export const CUSTOM_ORDER_FORM_CONTENT = {
  headline: "Gửi Thông Tin Yêu Cầu Báo Giá",
  formType: "custom_order",
  aside: "checklist",
  asideTitle: "Cam Kết Từ Salt & Light",
  asideItems: [
    "Thiết kế demo miễn phí đến khi bạn hài lòng.",
    "Chất vải 100% Cotton 4 chiều không phai, không xù.",
    "Đa dạng form size: Trẻ em, Nam, Nữ, Oversize.",
    "Chiết khấu trực tiếp lên đến 25% cho số lượng lớn.",
  ],
  isHotlineShown: true,
  contactItems: [],
};

export const CONTACT_PAGE_FORM_CONTENT = {
  headline: "Gửi Tin Nhắn Cho Shop",
  formType: "contact",
  aside: "contact_info",
  asideTitle: "",
  asideItems: [],
  isHotlineShown: false,
  contactItems: [
    { icon: "Phone", label: "Hotline & Zalo Tư Vấn", value: "0847 25 2025", note: "Hỗ trợ 8h00 - 21h00 hàng ngày" },
    { icon: "Mail", label: "Email Hỗ Trợ", value: "saltandlight.lienhe@gmail.com", note: "Phản hồi trong 24 giờ làm việc" },
    { icon: "MapPin", label: "Địa Chỉ", value: "TP. Hồ Chí Minh", note: "Giao hàng toàn quốc" },
  ],
  quote: "Hãy siêng năng mà chớ làm biếng; phải có lòng sốt sắng; phải hầu việc Chúa.",
  quoteRef: "Rô-ma 12:11",
};

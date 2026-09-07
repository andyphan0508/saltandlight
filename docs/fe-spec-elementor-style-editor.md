# FE Spec: Nâng cấp Page Builder lên chuẩn Elementor (kéo thả, chỉnh trực tiếp trên giao diện thật, phân loại block rõ ràng)

## 0. Tóm tắt cho người đọc nhanh

Hệ thống Content Block Builder hiện tại (`/admin/page-builder`) đã có nền tảng đúng hướng — 10 loại block đã type-safe, kéo-thả **sắp xếp thứ tự** bằng `dnd-kit`, form chỉnh nội dung theo từng loại. Nhưng đây **chưa phải trải nghiệm kiểu Elementor thật sự**, vì thiếu đúng điều làm nên Elementor: **chỉnh sửa trực tiếp trên bản xem trước = giao diện thật của trang** (WYSIWYG in-place editing), thay vì mở form riêng rồi đoán xem ngoài trang thật trông thế nào.

Tài liệu này: (1) tổng hợp đầy đủ các nhóm tính năng của Elementor (đã nghiên cứu, có nguồn), (2) đối chiếu với nền tảng đang có, (3) đưa ra roadmap cụ thể theo độ ưu tiên để Antigravity triển khai — ưu tiên **chắc, không bug** hơn là làm tràn lan nhiều tính năng nửa vời.

---

## 1. Toàn bộ nhóm tính năng của Elementor (nghiên cứu 2026)

Nguồn: elementor.com/blog, các bài đánh giá Elementor 2026 (wpschool.com, designslabpro.com, kbalom.com).

| Nhóm | Mô tả |
|---|---|
| **Visual Editor (WYSIWYG)** | Chỉnh sửa trực tiếp trên bản render thật của trang — không phải form tách biệt. Click vào bất kỳ phần tử nào trên canvas → panel chỉnh sửa hiện ra bên cạnh, thay đổi hiện ngay lập tức trên canvas. |
| **Containers (Flexbox/Grid)** | Khung chứa lồng nhau vô hạn (thay cho Section/Column cũ), mỗi container có thể là flex row/column, căn chỉnh, khoảng cách (gap), responsive riêng từng breakpoint. |
| **Widgets/Elements** | Free: 40+ widget cơ bản (Heading, Text, Image, Button, Video, Icon, Divider, Spacer, Icon Box, Image Box, Tabs, Accordion, Testimonial, Star Rating, Social Icons, HTML tùy chỉnh...). Pro: 100+ (Form, Popup trigger, Loop Grid, Countdown, Price Table...). |
| **Style Controls** | Typography (font, size, weight, line-height theo breakpoint), Màu sắc (solid/gradient), Background (màu/ảnh/video/overlay), Border & Shadow, Spacing (margin/padding từng cạnh), Hover state riêng. |
| **Responsive Editing** | Mỗi thuộc tính có thể set riêng cho Desktop / Tablet / Mobile (và custom breakpoint ở bản Pro), ẩn/hiện phần tử theo thiết bị. |
| **Global Design System** | Bảng màu global, Typography preset global — đổi 1 chỗ, áp dụng toàn site. |
| **Global Widgets/Templates** | Lưu 1 block/section thành "global" — dùng lại ở nhiều trang, sửa 1 nơi cập nhật tất cả nơi dùng. |
| **Template Library** | Thư viện mẫu dựng sẵn (trang đầy đủ, hoặc từng section: hero, feature, FAQ...) để chèn nhanh. |
| **Theme Builder** | Dựng header/footer/trang single/trang archive bằng chính visual editor (khái niệm này site đã có phần tương đương: Site Settings Editor cho header/footer). |
| **Popup Builder** | Tạo popup với điều kiện hiển thị (theo trang, theo hành vi: exit-intent, sau X giây, khi cuộn tới Y%). |
| **Form Builder** | Kéo-thả field form, lưu submission, tích hợp email. |
| **Loop Builder / Loop Grid** | Lưới lặp lại theo dữ liệu động (sản phẩm, bài viết) với template thẻ tùy chỉnh — site đã có tương đương một phần (`FEATURED_PRODUCTS`/`PRODUCT_LIST` block). |
| **Motion Effects** | Hiệu ứng xuất hiện khi cuộn (entrance animation), hiệu ứng hover, parallax theo chuột/cuộn. |
| **Navigator Panel** | Cây cấu trúc trang dạng danh sách thu gọn — chọn/kéo sắp xếp phần tử lồng sâu dễ hơn là click trực tiếp trên canvas. |
| **Revision History** | Undo/redo và lịch sử phiên bản, khôi phục lại bản cũ. |
| **Copy/Paste Style** | Copy toàn bộ style từ phần tử này dán sang phần tử khác. |
| **Custom CSS/Attributes per element** | Chèn CSS hoặc HTML attribute tùy chỉnh cho từng phần tử (Pro). |
| **Kit Library / Export-Import** | Đóng gói toàn bộ thiết kế (màu, font, template) thành 1 "Kit" để dùng lại/chia sẻ. |
| **Elementor AI** | Sinh text, sinh ảnh, sinh code ngay trong editor. |
| **WooCommerce Builder** | Dựng trang sản phẩm/danh mục bằng visual editor — site này **đã là** cửa hàng nên phần này tương đương chính catalog/product-detail hiện có, không cần làm lại bằng block. |

---

## 2. Đối chiếu với nền tảng hiện tại của site

**Đã có, giữ nguyên và tận dụng:**
- `PageBlock` model (Prisma) — 10 loại block: `PAGE_HERO, FEATURE_CARDS, FEATURED_PRODUCTS, PRODUCT_LIST, STORY_BANNER, PROMO_CTA, TESTIMONIALS, RICH_TEXT_SECTIONS, CONTACT_INFO, CTA_BANNER`, áp dụng cho 4 trang tĩnh (`home, gioi-thieu, lien-he, chinh-sach`).
- Kéo-thả **sắp xếp block** bằng `dnd-kit` (`BlockList.tsx`).
- Form chỉnh nội dung theo từng loại block (`BlockEditForm.tsx`), palette chọn loại block mới (`BlockPaletteModal.tsx`).
- Site Settings Editor (header/footer/logo/menu) — đã đóng vai trò tương đương "Theme Builder" ở quy mô nhỏ, có live mini-preview (mock, không phải trang thật).

**Khoảng trống lớn nhất — đây là trọng tâm cần làm:**
- **Chưa có chỉnh sửa trực tiếp trên giao diện thật.** Preview hiện tại (ở Site Settings) là 1 `<div>` mô phỏng lại layout, KHÔNG phải trang thật — sửa xong phải bấm lưu rồi mở tab khác xem thật mới biết đúng/sai. Đây là khoảng cách lớn nhất so với Elementor.
- Không có style controls trực quan (màu, spacing, typography) — hiện chỉnh nội dung qua field text/number thuần.
- Không có global design tokens (màu/font dùng chung).
- Không có block/template dùng lại được giữa các trang.
- Không có responsive per-breakpoint control.
- Không có popup builder, revision history, copy/paste style.

---

## 3. Roadmap triển khai theo độ ưu tiên

**Nguyên tắc xuyên suốt: làm ít nhưng chắc, không bug — mỗi tier chỉ bắt đầu khi tier trước đã ổn định.**

### Tier 1 — Live Visual Editor (quan trọng nhất, giải quyết đúng khoảng trống lớn nhất)

Đổi cơ chế preview từ "form + mock preview" sang **iframe nhúng đúng trang thật của storefront**, đây cũng chính là cách Elementor thật sự vận hành (Elementor cũng dùng iframe chứa theme thật của WordPress, không tự vẽ lại UI).

- Trang `/admin/page-builder` chia 2 cột: bên trái danh sách block (như hiện tại), bên phải là `<iframe src="/{page-slug}?editor=1">` — load ĐÚNG trang storefront thật (dùng route sẵn có: `/`, `/gioi-thieu`, `/lien-he`, `/chinh-sach`).
- Storefront khi có query `?editor=1` (chỉ kích hoạt trong iframe, kiểm tra `window.self !== window.top` để không ảnh hưởng người dùng thật):
  - Mỗi `BlockRenderer` bọc thêm 1 lớp `data-block-id="{id}"` + border highlight khi hover, click vào 1 block trong iframe → `postMessage({type: "block:select", blockId})` gửi ra parent (trang admin).
  - Trang admin nhận message → tự động mở đúng `BlockEditForm` của block đó (thay vì phải tự tìm trong danh sách bên trái).
  - Khi admin sửa form bên trái → gửi `postMessage({type: "block:preview", blockId, content})` VÀO iframe → iframe cập nhật DOM tạm thời (không gọi API, không reload) để thấy thay đổi tức thì trước khi bấm Lưu — đây chính là cảm giác "trực quan" mà Elementor mang lại.
  - Nút "Lưu" mới gọi API thật (`PATCH` block hiện có) và reload lại iframe để đồng bộ.
- **Lưu ý bảo mật/kỹ thuật quan trọng**: route `?editor=1` KHÔNG được lộ ra ngoài (chỉ admin đã đăng nhập mới vào được `/admin/page-builder`, nhưng iframe src trỏ tới route storefront công khai — cần đảm bảo `?editor=1` chỉ bật lớp overlay chỉnh sửa, KHÔNG bao giờ lộ dữ liệu chưa publish hay bypass cache cho người dùng thường vô tình có query đó). Đề xuất: chỉ bật overlay khi `document.referrer` hoặc `window.top` xác nhận đang chạy trong iframe admin — không dựa vào query param đơn thuần để quyết định hiển thị nội dung khác.

### Tier 2 — Mở rộng thư viện block + Style Controls cơ bản

- Thêm các block/widget phổ biến nhất của Elementor mà site còn thiếu, ưu tiên loại **an toàn, không cần HTML tùy ý** (tránh rủi ro XSS vì nội dung block hiển thị công khai): `ACCORDION` (câu hỏi thường gặp — rất hợp với 1 shop áo thun/quà tặng), `IMAGE_GALLERY` (lưới ảnh), `DIVIDER_SPACER`, `VIDEO_EMBED` (chỉ nhận URL YouTube/Vimeo, validate domain — không nhúng iframe tuỳ ý), `COUNTDOWN` (đếm ngược khuyến mãi — rất hợp e-commerce).
- Style controls cho các field có sẵn: thêm color picker cho các chỗ đang là text màu hex thô, thêm lựa chọn spacing (nhỏ/vừa/lớn — dùng preset, KHÔNG cho nhập CSS tự do) cho khoảng cách giữa các block.
- **Không làm**: custom CSS tự do / chèn HTML tùy ý per-block — đây là bề mặt tấn công XSS nghiêm trọng nhất của các page builder, và nội dung block ở site này hiển thị public không qua kiểm duyệt lại — nếu thực sự cần, phải có bước sanitize HTML phía server (DOMPurify hoặc tương đương) trước khi lưu, không tin tưởng HTML từ admin input tuyệt đối.

### Tier 3 — Block dùng lại được (Global Blocks) + Responsive

- Thêm khả năng đánh dấu 1 block là "dùng chung" — hiện ở mọi trang có chọn, sửa 1 nơi cập nhật hết (cần Prisma: thêm bảng `GlobalBlock` hoặc field `isGlobal`/`globalBlockId` liên kết — **phần này cần BE làm cùng**, Antigravity không tự đổi schema).
- Ẩn/hiện từng block theo thiết bị (desktop/mobile) — chỉ cần thêm field `hiddenOn: ("mobile"|"desktop")[]` vào `content` JSON hiện có của block, style bằng Tailwind responsive class, không cần đổi schema DB.

### Tier 4 — Nâng cao (làm sau, khi Tier 1-3 đã ổn định và không còn bug)

- Revision history đơn giản (lưu snapshot JSON của `content` mỗi lần sửa, cho phép khôi phục — cần bảng mới, phối hợp BE).
- Popup Builder cho khuyến mãi (ví dụ popup giảm giá khi khách sắp rời trang) — cân nhắc kỹ vì dễ gây khó chịu UX nếu làm ẩu; nếu làm, phải có tần suất hiển thị giới hạn (vd 1 lần/phiên, lưu vào localStorage).
- Copy/paste style giữa các block cùng loại.

---

## 4. Nguyên tắc chất lượng ("chắc features, no bug")

1. **Không tự ý đổi Prisma schema** — mọi thay đổi cần bảng/field mới (Global Blocks, Revision History) phải trao đổi với BE trước khi làm, theo đúng ranh giới đã thống nhất giữa Antigravity (FE) và Claude Code (BE) trong repo này.
2. **Không render HTML thô từ dữ liệu block** (`dangerouslySetInnerHTML`) trừ khi đã qua sanitize phía server — nội dung block hiển thị công khai cho mọi khách truy cập site.
3. **Kiểm tra kỹ hiệu năng iframe preview**: KHÔNG re-render toàn bộ iframe (reload trang) mỗi lần gõ phím trong form — chỉ cập nhật đúng phần DOM của block đang sửa qua `postMessage`, tránh giật lag và tránh tốn thêm request tới Worker (site đang chạy trên Cloudflare Workers free tier, đã có lịch sử bug về CPU-time/concurrent-request — tránh thêm tải không cần thiết).
4. **Test từng loại block** sau khi thêm style controls mới — đảm bảo không phá layout các block cũ đã có nội dung thật trên production.
5. **Responsive thật**: test trên cả 3 kích thước (mobile/tablet/desktop) trước khi coi 1 tính năng là xong — site có `resize_window` preset trong Browser tool để test nhanh.
6. **Giữ đúng phong cách UI hiện tại** (`luno-card`, `PageHeader`, `sonner` toast, modal overlay tự dựng — không cần thêm thư viện UI mới).

---

## 5. Việc cần BE (Claude Code) làm — không tự triển khai bên FE

- Global Blocks: bảng/field mới trong Prisma + API.
- Revision History: bảng snapshot mới + API.
- Nếu thêm loại block mới cần validate phức tạp (vd `VIDEO_EMBED` giới hạn domain, `COUNTDOWN` giới hạn định dạng ngày giờ) — cần thêm case vào `pageBlockContentSchema` (`apps/web/src/lib/admin/schemas.ts`) — báo lại để BE thêm, không tự ý nới lỏng validation ở FE.

Khi cần các phần này, nhắn để Claude Code triển khai BE tương ứng trước khi Antigravity build UI phụ thuộc vào chúng.

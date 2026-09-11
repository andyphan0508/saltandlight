# FE Spec: Nội dung sản phẩm & trang "Đặt theo yêu cầu" chỉnh sửa được

Backend đã sẵn sàng, không cần API/schema mới — chỉ cần nối FE vào đúng chỗ.

## 1. Bảng size / hướng dẫn giặt / điểm nổi bật — dùng lại hệ block content đã có

`Product.description` đã hỗ trợ JSON block content (`packages/`... à không, `apps/web/src/lib/product-content.ts`), gồm sẵn: `paragraph`, `heading`, `bullet_list`, `callout` (icon+title+body — đúng cho từng thẻ "🧼 Giặt áo"), `specs_table` (rows label/value — đúng cho bảng size), `quote`, `image`. Render qua `<ProductContentRenderer content={...} />` (đã có sẵn).

**Việc cần làm ở `san-pham/[slug]/page.tsx`**: xoá 2 khối đang hardcode cứng — "Điểm Nổi Bật Của Sản Phẩm" (dòng ~137-168) và "Hướng dẫn bảo quản áo cotton" (dòng ~180-197) — thay bằng render `description` blocks (đã có `<ProductContentRenderer>` render 1 lần cho toàn bộ `description`, không cần tách riêng từng section nữa).

**Việc cần làm ở `ProductBuyBox.tsx`**: bảng size trong modal (dòng ~358-392) đang hardcode 1 bảng chung cho MỌI sản phẩm (kể cả túi tote!) — sai với sản phẩm không phải áo. Đổi sang đọc `specs_table` block(s) từ `description`, ẩn nút "Bảng size" nếu sản phẩm không có `specs_table` nào.

**Việc cần làm ở `components/admin/ProductForm.tsx`**: field `description` hiện chắc đang là textarea thô. Đổi sang block editor thân thiện — tái dùng `ArrayEditor`/pattern đã có ở `page-builder/BlockEditForm.tsx`, chỉ cần map đúng 7 loại block trong `ProductContentBlock` thay vì 10 loại PageBlock. Không tự chế hệ thống mới.

## 2. Trang "Đặt theo yêu cầu" — đã bật CMS, chỉ cần nối

Backend đã thêm `"dat-theo-yeu-cau"` vào `PAGE_SLUGS` — admin `/admin/page-builder?page=dat-theo-yeu-cau` đã chọn được trang này rồi.

**Việc cần làm**: sửa `dat-theo-yeu-cau/page.tsx` giống hệt pattern `chinh-sach/page.tsx`/`gioi-thieu/page.tsx` đã làm — gọi `getCachedPageBlocks("dat-theo-yeu-cau")` (hoặc `listPageBlocks` khi `?editor=1`), render qua `<BlockRenderer>`, giữ `DEFAULT_*_BLOCKS` làm fallback y hệt nội dung tĩnh hiện tại để không đổi gì nếu admin chưa từng sửa.

## Không làm gì thêm ở BE
Đã kiểm tra kỹ — không cần cột DB mới, không cần API mới. Toàn bộ là nối FE vào hệ thống content-block đã tồn tại.

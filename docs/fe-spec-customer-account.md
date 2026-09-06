# FE Spec: Đăng nhập khách hàng, Quản lý đơn hàng, Turnstile cho Liên hệ

Backend cho các tính năng dưới đây đã xong (branch `cloudflare-pages`). Tài liệu này mô tả đúng API/contract để FE gọi — không có phần code mẫu UI, tự thiết kế theo phong cách hiện có của site.

---

## 1. Trang đăng nhập — `/dang-nhap`

Đăng nhập bằng OAuth Google/Facebook qua Supabase Auth. Không có đăng nhập email/mật khẩu.

**Dùng client Supabase có sẵn**: `import { createSupabaseBrowserClient } from "@/lib/supabase/client"`.

```ts
const supabase = createSupabaseBrowserClient();
await supabase.auth.signInWithOAuth({
  provider: "google", // hoặc "facebook"
  options: { redirectTo: `${window.location.origin}/auth/callback?next=/tai-khoan` },
});
```

Backend route `GET /auth/callback` đã xử lý: exchange code, tạo/liên kết `Customer` (tự động gộp lịch sử đơn hàng guest cũ theo email), rồi redirect về `next`. Lỗi → redirect về `/dang-nhap?error=auth` — FE nên đọc query `error` để hiện thông báo.

**Quan trọng**: KHÔNG bắt buộc đăng nhập mới được mua hàng — giữ nguyên luồng checkout khách vãng lai hiện tại. Trang đăng nhập chỉ là 1 lựa chọn thêm, nên có nút/link "Tiếp tục mua sắm không cần đăng nhập" quay lại trang trước hoặc `/san-pham`.

**Trạng thái đăng nhập ở Header**: gọi `GET /api/customer/me` — trả `{ customer: {...} }` (200) nếu đã đăng nhập, hoặc `{ customer: null }` (401) nếu chưa. Dùng để hiện icon tài khoản → `/tai-khoan` (đã đăng nhập) hoặc `/dang-nhap` (chưa).

---

## 2. Trang tài khoản / Quản lý đơn hàng — `/tai-khoan`

Yêu cầu đăng nhập — nếu `GET /api/customer/me` trả 401, redirect về `/dang-nhap`.

### Thông tin tài khoản
`GET /api/customer/me` →
```json
{ "customer": { "id": "uuid", "fullName": "string", "email": "string|null", "phone": "string|null" } }
```
`phone` có thể `null` nếu khách chưa từng đặt hàng lần nào sau khi đăng nhập (OAuth không cung cấp số điện thoại).

### Đăng xuất
Gọi thẳng `supabase.auth.signOut()` (client-side, không cần gọi API riêng), sau đó redirect về `/`.

### Danh sách đơn hàng
`GET /api/customer/orders` (401 nếu chưa đăng nhập) →
```json
{
  "orders": [
    {
      "orderNumber": "string",
      "status": "pending_payment | processing | on_hold | completed | cancelled | refunded",
      "total": "number",
      "createdAt": "ISO date string",
      "items": [
        { "productNameSnapshot": "string", "color": "string|null", "size": "string|null", "quantity": "number", "unitPrice": "number" }
      ],
      "statusHistory": [
        { "toStatus": "string", "changedAt": "ISO date string", "note": "string|null" }
      ]
    }
  ]
}
```

**Nhãn trạng thái tiếng Việt**: dùng `ORDER_STATUS_LABELS` từ `@saltandlight/domain` (đã export sẵn) để hiện đúng chữ tiếng Việt cho `status`, thay vì tự viết map riêng:
```ts
import { ORDER_STATUS_LABELS } from "@saltandlight/domain";
ORDER_STATUS_LABELS[order.status] // "Đang xử lý & Đóng gói", v.v.
```

⚠️ **Lưu ý**: hiện `admin/orders/page.tsx` và `tra-cuu-don-hang/page.tsx` đang có 2 bộ nhãn trạng thái khác nhau (wording/màu lệch nhau). `ORDER_STATUS_LABELS` mới lấy theo bản wording ở `tra-cuu-don-hang` (thân thiện khách hàng hơn). Khuyến khích khi có dịp đồng bộ luôn `tra-cuu-don-hang/page.tsx` sang dùng `ORDER_STATUS_LABELS` chung thay vì định nghĩa `STATUS_LABEL` cục bộ.

---

## 3. Cập nhật form Liên hệ / Hỗ trợ — `/lien-he` (`ContactForm.tsx`)

Thêm Cloudflare Turnstile để chặn spam bot. Site key public, an toàn để đưa vào code FE: biến môi trường `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

- Nhúng script Turnstile: `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`, render widget `<div class="cf-turnstile" data-sitekey="...">` (hoặc dùng thư viện React wrapper nếu đã có sẵn trong stack).
- Lấy token từ widget (Turnstile gọi callback hoặc set giá trị vào input ẩn `cf-turnstile-response`), gửi kèm trong payload POST tới `/api/contact` dưới tên field **`turnstileToken`**.
- Backend giờ **bắt buộc** field này — nếu thiếu/sai, API trả `400` với `{ "error": "Xác minh Turnstile thất bại, vui lòng thử lại." }` hoặc lỗi validation zod nếu field trống hoàn toàn. FE cần hiện lỗi này rõ ràng cho người dùng và cho phép thử lại (Turnstile widget có method reset).

**⚠️ QUAN TRỌNG VỀ THỨ TỰ TRIỂN KHAI**: `contactFormSchema` đã bắt buộc `turnstileToken` ngay trong code backend hiện tại. Nếu deploy phần backend này TRƯỚC khi FE thêm widget Turnstile, **form Liên hệ hiện tại sẽ hỏng** (mọi submit đều bị từ chối 400 vì thiếu `turnstileToken`). Cần phối hợp: chỉ deploy đồng thời, hoặc FE làm xong trước rồi mới bật phần backend này lên production.

---

## File/API tham khảo phía Backend (đã có sẵn, không cần tạo lại)
- `apps/web/src/lib/supabase/client.ts` — `createSupabaseBrowserClient()`
- `apps/web/src/app/auth/callback/route.ts` — xử lý OAuth callback
- `apps/web/src/app/api/customer/me/route.ts`, `api/customer/orders/route.ts`
- `packages/domain` → `ORDER_STATUS_LABELS`

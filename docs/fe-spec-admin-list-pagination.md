# FE Spec: Phân trang các trang danh sách trong Admin

Bối cảnh: vừa xong 1 đợt tối ưu backend (rate-limit, cache, giới hạn query) trên nhánh `cloudflare-pages`. Trong lúc khảo sát phát hiện 5 trang admin dưới đây tự query Prisma trực tiếp trong Server Component (`page.tsx`) và **chưa phân trang** — tải nguyên bảng mỗi lần vào trang, sẽ chậm/tốn bộ nhớ dần khi dữ liệu lớn lên trên Cloudflare Workers free tier. Đây là việc thuộc `.tsx`, ngoài phạm vi backend nên Claude Code không tự sửa — cần Antigravity áp dụng.

Có sẵn pattern chuẩn đang chạy tốt, chỉ cần lặp lại đúng pattern đó — không cần thiết kế lại UI, không cần component mới.

## Pattern chuẩn (tham khảo `apps/web/src/app/admin/(dashboard)/products/page.tsx` hoặc `.../customers/page.tsx` — 2 trang này đã đúng chuẩn, không cần đổi)

```ts
export default async function XPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string /* + filter khác nếu có */ };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const PAGE_SIZE = 15; // tuỳ trang, xem gợi ý bên dưới

  const where = /* giữ nguyên filter hiện có, nếu có */;

  const [items, total] = await Promise.all([
    prisma.X.findMany({
      where,
      orderBy: /* giữ nguyên */,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: /* giữ nguyên field đang lấy */,
    }),
    prisma.X.count({ where }),
  ]);

  // ...render list...

  return (
    // ...
    <Pagination
      page={page}
      pageSize={PAGE_SIZE}
      total={total}
      basePath="/admin/x"
      searchParams={{ q /* + filter khác nếu có */ }}
    />
  );
}
```

`Pagination` đã có sẵn ở `@/components/admin/Pagination` — import và dùng lại, không cần tạo mới.

## 5 trang cần thêm phân trang

1. **`/admin/contacts`** — `apps/web/src/app/admin/(dashboard)/contacts/page.tsx`. `prisma.contactSubmission.findMany` hiện không giới hạn. Nếu trang đang có ô tìm kiếm/filter status/type, giữ nguyên logic filter, chỉ thêm `skip`/`take`/`count` + `<Pagination>`.
2. **`/admin/banners`** — `.../banners/page.tsx`. Số banner thường ít nên không gấp, nhưng nên làm cho nhất quán.
3. **`/admin/promotions`** — `.../promotions/page.tsx`.
4. **`/admin/categories`** — `.../categories/page.tsx`.
5. **`/admin/users`** — `.../users/page.tsx`. Quản trị viên nội bộ thường rất ít (vài người) — ưu tiên thấp nhất trong danh sách này, có thể bỏ qua nếu muốn.

`/admin/products` và `/admin/customers` **đã đúng chuẩn rồi, không cần đổi gì**.

Gợi ý `PAGE_SIZE`: 15 (giống `customers`) cho contacts/promotions/categories/users; banner có thể để nguyên hoặc 20 vì thường ít mục.

## Hai việc khác — không gấp, cân nhắc riêng

### CSP đang cho phép `unsafe-inline`
`apps/web/next.config.mjs` có CSP với `script-src 'self' 'unsafe-inline'` và `style-src 'self' 'unsafe-inline'` — làm giảm hiệu quả chống XSS. Siết lại cần chuyển sang CSP theo nonce, phải rà lại toàn bộ script/style inline đang tồn tại trong UI trước khi đổi (rủi ro nếu làm vội, có thể chặn nhầm script hợp lệ). Nên tách thành 1 task riêng, không làm gấp cùng lúc.

### Đăng nhập admin chưa có rate-limit ở tầng app
`/admin/login` gọi trực tiếp `supabase.auth.signInWithPassword` từ client, không qua middleware nên rate-limiter hiện tại của site không áp dụng được — hiện chỉ dựa vào giới hạn mặc định của Supabase Auth (đã có, không phải lỗ hổng cấp thiết). Nếu sau này muốn thêm 1 lớp chống brute-force riêng: backend làm route `POST /api/admin/login` proxy đăng nhập qua Supabase (phần này Claude Code làm được), và đổi trang login gọi route đó thay vì gọi Supabase trực tiếp (phần `.tsx` cần Antigravity). Chưa cần làm ngay.

---
name: frontend-ui-antigravity
description: >-
  Sử dụng skill này cho MỌI task liên quan đến xây dựng, chỉnh sửa hoặc tối ưu giao diện web (UI/UX) — tạo trang mới, component, layout, form, dashboard, landing page, hoặc refactor giao diện cũ. Bắt buộc áp dụng khi có nhắc đến "giao diện", "UI", "component", "trang web", "landing page", "dashboard", "màn hình", "state", "Zustand", "loading", "performance", "Cloudflare", "Prisma", "Supabase" — kể cả khi user không nói rõ từ "thiết kế". Skill này bao trùm 4 trụ cột bắt buộc — thiết kế trực quan không mang tính AI-generic; tối ưu performance/loading, UI state handling và bảo mật; kiến trúc source theo chuẩn components/index.tsx; state management bằng Zustand kết hợp free-tier Cloudflare/Prisma/Supabase.
---

# Frontend UI Builder — Antigravity

Đóng vai trò **tech lead kiêm design lead**: mọi giao diện làm ra phải vừa đẹp có chủ đích, vừa chạy nhanh, vừa an toàn, vừa dễ bảo trì. Không có bước nào trong 4 bước dưới đây được bỏ qua, kể cả khi task nhìn có vẻ nhỏ (một component đơn lẻ vẫn phải tuân thủ cấu trúc folder + state pattern).

## Quy trình bắt buộc cho mọi task UI

1. **Plan trước khi code** — xác định: trang/feature này phục vụ ai, nội dung thật là gì (không dùng lorem ipsum), có cần state global không, có gọi API/DB không.
2. **Thiết kế trực quan** — đọc `references/design-principles.md` trước khi viết bất kỳ dòng CSS/className nào. Đây là bước hay bị bỏ qua nhất và làm hỏng cả sản phẩm.
3. **Dựng kiến trúc source** — đọc `references/architecture-folder-structure.md`, tuân thủ nghiêm pattern `index.tsx` chỉ lắp ráp, logic nằm trong `components/`.
4. **State + Backend free-tier** — đọc `references/state-management-zustand.md` và `references/free-tier-stack.md` khi task có state phức tạp hoặc cần backend.
5. **Performance + bảo mật** — đọc `references/performance-security.md`, áp checklist trước khi coi task là xong.
6. **Tự review** — chạy qua `references/final-checklist.md` như một QA thật sự trước khi trả kết quả.
7. **Kiểm tra interface** — đọc file `.ts` trong folder `types` để biết interface của API trước khi code.

## 1. Thiết kế trực quan — không được AI-generic

Task đầu tiên của bất kỳ giao diện nào là **tránh các tell của "AI tạo ra"**: nền be #F4F1EA + serif tương phản cao + accent cam đất, card bo góc đều tăm tắp với shadow xám mờ giống hệt nhau, eyebrow label viết hoa tracking rộng, gạch giữa "A · B · C", mũi tên "→" cuối mọi link.

Quy trình 2 pass bắt buộc:
- **Pass 1 — Token plan**: chốt bảng màu 4–6 mã hex có tên, 1–2 typeface có vai trò rõ ràng, layout concept bằng ASCII wireframe, 3–4 nguyên tắc riêng cho sản phẩm này.
- **Pass 2 — Review lại token plan**: nếu bất kỳ phần nào giống mặc định generic → sửa lại, ghi rõ sửa gì và tại sao. Chỉ code sau khi plan đã "may đo" cho đúng sản phẩm, không phải công thức chung.

Chi tiết đầy đủ (bảng màu ví dụ, quy tắc typography, cách viết microcopy không robot) → đọc `references/design-principles.md`.

## 2. Kiến trúc source — `/components` + `index.tsx` mỏng

Nguyên tắc cốt lõi: **`index.tsx` không chứa logic**, chỉ import component/hook/function và truyền props xuống. Toàn bộ business logic, side-effect, style nằm trong các file con của `/components`. Các tên của tất cả các cây thư mục phải được viết bằng tiếng anh đồng nhất hết. Ví dụ `src/app/admin/users/page.tsx` được phép gọi `<UsersView />` thay vì tự viết code trong `page.tsx`. Tên gọi `chinh-sach` thì phải gọi là `policy` chứ không được gọi là `chinh-sach`. Áp dụng trong toàn source code

Nguyên tắc function component hay dùng arrow function, ví dụ `const Button = () => { ... }`. Và các function nếu là 1 action hoặc tính năng nào đó thì thường hay có tiền tố là `on`, ví dụ `onLogin`, `onLogout`, `onRegister`. Còn function trả về kết quả boolean thì hay có tiền tố là `is`, ví dụ `isLoggedIn`, `isSubmitting`, `isValid`.

```
src/
├── app/                      # routes (Next.js App Router) — mỗi route chỉ 1 index.tsx mỏng
│   └── dashboard/
│       └── page.tsx           # gọi <DashboardView /> + truyền props, KHÔNG chứa logic
├── components/
│   └── dashboard/
│       ├── index.tsx           # lắp ráp các sub-component, không tự chứa JSX phức tạp
│       ├── DashboardHeader.tsx
│       ├── DashboardChart.tsx
│       └── useDashboardData.ts # custom hook chứa logic gọi state/API
├── stores/                    # Zustand stores
├── lib/                        # Prisma client, Supabase client, helpers thuần
└── styles/
```

Chi tiết quy ước đặt tên, tách hook, barrel export → đọc `references/architecture-folder-structure.md`.

## 3. State management — Zustand

Zustand là nguồn state global duy nhất cho client state (UI state cục bộ vẫn dùng `useState`/`useReducer` bình thường). Mỗi domain có 1 store riêng trong `/stores`, không gộp thành 1 store khổng lồ.

Chi tiết pattern store (slice pattern, selector để tránh re-render thừa, cách kết hợp với server state) → đọc `references/state-management-zustand.md`.

## 4. Backend free-tier — Cloudflare / Prisma / Supabase

Ưu tiên kiến trúc **zero-cost khi ở quy mô nhỏ**: Cloudflare Pages/Workers cho hosting + edge logic, Supabase cho Postgres + Auth + Storage (hoặc Prisma trỏ vào Supabase Postgres nếu cần ORM type-safe), Cloudflare KV/R2 cho cache/asset tĩnh.

Chi tiết giới hạn free tier, khi nào chọn Supabase client thuần vs Prisma, cách tránh vượt quota → đọc `references/free-tier-stack.md`.

## 5. Performance, UI state handling, bảo mật

Bắt buộc có: skeleton/loading state cho mọi async call, error boundary, optimistic update khi hợp lý, code-splitting theo route, ảnh dùng `next/image` hoặc tương đương, không lộ secret ở client, validate input hai lớp (client + server).

Chi tiết checklist đầy đủ → đọc `references/performance-security.md`.

## Trước khi trả kết quả

Luôn chạy qua `references/final-checklist.md`. Nếu thiếu bất kỳ mục nào (ví dụ: `index.tsx` vẫn còn chứa logic, hoặc thiếu loading state), phải sửa lại trước khi báo hoàn thành.

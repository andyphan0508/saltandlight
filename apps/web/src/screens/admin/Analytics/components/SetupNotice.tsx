/** Shown until the SQL API token is in place — tracking already records visits in the meantime. */
export const SetupNotice = ({ reason }: { reason: "unconfigured" | "error"; message?: string }) => (
  <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
    <h2 className="font-bold">
      {reason === "unconfigured" ? "Cần 1 bước cấu hình để xem số liệu truy cập" : "Chưa đọc được số liệu truy cập"}
    </h2>
    <p className="mt-1 text-xs leading-relaxed">
      Website <strong>đã bắt đầu ghi nhận lượt truy cập</strong> vào Cloudflare Analytics Engine. Để trang này đọc được số liệu, cần một
      API token chỉ có quyền đọc thống kê:
    </p>
    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed">
      <li>
        Mở <strong>dash.cloudflare.com → My Profile → API Tokens → Create Token → Custom token</strong>.
      </li>
      <li>
        Quyền: <strong>Account · Account Analytics · Read</strong> (chỉ quyền này), rồi tạo token.
      </li>
      <li>
        Chạy trong thư mục dự án: <code className="rounded bg-white px-1">npx wrangler secret put CF_ANALYTICS_API_TOKEN</code> (dán token), và{" "}
        <code className="rounded bg-white px-1">npx wrangler secret put CF_ACCOUNT_ID</code> (dán Account ID).
      </li>
    </ol>
    <p className="mt-3 text-xs">Số liệu đơn hàng bên dưới lấy từ database nên đã hiển thị ngay.</p>
  </section>
);

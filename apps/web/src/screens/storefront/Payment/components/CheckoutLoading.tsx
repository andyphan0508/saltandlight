/** Shown until the persisted cart has hydrated from storage. */
export const CheckoutLoading = () => (
  <div className="mx-auto max-w-4xl px-4 py-24 text-center animate-fade-in">
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-forest border-t-transparent" />
    <p className="mt-4 text-sm font-medium text-ink/60">Đang chuẩn bị trang thanh toán…</p>
  </div>
);

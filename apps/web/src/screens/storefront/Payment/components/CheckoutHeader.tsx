/** Page title with the cart → checkout → done progress. */
export const CheckoutHeader = () => (
  <div className="border-b border-ink/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-ink">Thanh Toán Đơn Hàng</h1>
      <p className="text-xs text-ink/60 mt-1">Vui lòng điền thông tin người nhận để Salt &amp; Light giao hàng tận nơi.</p>
    </div>

    <div className="flex items-center gap-2 text-xs font-bold text-ink/40">
      <span className="text-brand-forest">1. Giỏ hàng</span>
      <span>→</span>
      <span className="rounded-full bg-ink px-3 py-1 text-white">2. Giao hàng &amp; Thanh toán</span>
      <span>→</span>
      <span>3. Hoàn tất</span>
    </div>
  </div>
);

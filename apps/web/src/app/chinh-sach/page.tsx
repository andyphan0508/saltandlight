import { RefreshCw, Truck, ShieldCheck, Check, Phone } from "@/components/Icons";

export const metadata = {
  title: "Chính sách đổi trả & Giao hàng · Salt & Light",
  description: "Chính sách đổi size trong 7 ngày, biểu phí đồng giá ship 19K và bảng quy đổi size tại Salt & Light.",
};

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-brand-forest">
          Minh bạch &amp; Tận tâm
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-ink">
          Chính Sách Bán Hàng &amp; Đổi Trả
        </h1>
        <p className="text-sm text-ink/70 max-w-xl mx-auto">
          Salt &amp; Light cam kết mang lại trải nghiệm mua sắm an tâm tuyệt đối cho quý khách hàng.
        </p>
      </div>

      {/* 3 Main Policy Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
            <RefreshCw size={20} />
          </div>
          <h3 className="font-bold text-sm uppercase text-ink">Đổi Trả Trong 7 Ngày</h3>
          <p className="text-xs text-ink/70 leading-relaxed">
            Hỗ trợ đổi size hoặc đổi mẫu khác trong vòng 7 ngày kể từ khi nhận hàng nếu áo chưa qua sử dụng.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
            <Truck size={20} />
          </div>
          <h3 className="font-bold text-sm uppercase text-ink">Đồng Giá Ship 19K</h3>
          <p className="text-xs text-ink/70 leading-relaxed">
            Áp dụng cho mọi tỉnh thành trên toàn quốc. Đơn hàng từ 299.000₫ được miễn phí vận chuyển 100%.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-sm uppercase text-ink">Kiểm Hàng Trước Khi Nhận</h3>
          <p className="text-xs text-ink/70 leading-relaxed">
            Khách hàng được quyền mở gói hàng kiểm tra đúng mẫu, đúng màu sắc và kích thước trước khi nhận.
          </p>
        </div>
      </div>

      {/* Detailed Policy Text */}
      <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-card border border-ink/5 space-y-8 text-sm text-ink/80 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-base font-black uppercase text-ink">
            1. Quy Trình Đổi Hàng Đơn Giản
          </h2>
          <p className="text-xs text-ink/70">
            Nếu bạn nhận áo mặc chưa vừa vặn hoặc muốn đổi sang mẫu khác:
          </p>
          <ul className="space-y-2 text-xs text-ink/75 list-disc pl-5">
            <li>Liên hệ hotline / Zalo <strong>0847 25 2025</strong> hoặc nhắn tin cho Salt &amp; Light.</li>
            <li>Cung cấp mã đơn hàng và kích cỡ bạn muốn đổi.</li>
            <li>Shipper sẽ mang áo mới đến tận nhà đổi trực tiếp và thu hồi lại áo cũ (bạn không cần phải tự mang đi gửi bưu cục).</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-ink/10 pt-6">
          <h2 className="font-display text-base font-black uppercase text-ink">
            2. Thời Gian Giao Hàng Dự Kiến
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-2xl bg-cream p-4">
              <p className="font-bold text-ink">Nội thành TP. Hồ Chí Minh</p>
              <p className="text-ink/60 mt-1">Giao trong 1 - 2 ngày làm việc.</p>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <p className="font-bold text-ink">Các tỉnh thành khác toàn quốc</p>
              <p className="text-ink/60 mt-1">Giao trong 2 - 4 ngày làm việc.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t border-ink/10 pt-6">
          <h2 className="font-display text-base font-black uppercase text-ink">
            3. Phương Thức Thanh Toán
          </h2>
          <p className="text-xs text-ink/70">
            Salt &amp; Light hỗ trợ 2 hình thức thanh toán thuận tiện:
          </p>
          <div className="space-y-2 text-xs text-ink/75">
            <p>• <strong>Chuyển khoản VietQR tự động:</strong> Quét mã QR hiển thị ngay sau khi đặt hàng.</p>
            <p>• <strong>Thanh toán khi nhận hàng (COD):</strong> Kiểm tra hàng rồi thanh toán tiền mặt cho shipper.</p>
          </div>
        </section>
      </div>

      <div className="rounded-3xl bg-mint-50 p-6 border border-mint-200 text-center text-xs text-ink/70">
        <p className="font-bold text-ink">Mọi thắc mắc cần hỗ trợ, vui lòng liên hệ:</p>
        <p className="mt-1">
          Hotline: <strong>0847 25 2025</strong> • Email: <strong>saltandlight.lienhe@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}

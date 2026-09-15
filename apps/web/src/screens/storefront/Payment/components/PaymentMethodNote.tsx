import { ShieldCheck } from "@/components/Icons";

export const PaymentMethodNote = () => (
  <div className="rounded-3xl bg-mint-50 p-6 border border-mint-200 space-y-3">
    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-forest flex items-center gap-2">
      <ShieldCheck size={16} />
      Phương Thức Thanh Toán VietQR Tự Động
    </h3>
    <p className="text-xs text-ink/75 leading-relaxed">
      Sau khi bấm <strong>Đặt Hàng</strong>, hệ thống sẽ tự động hiển thị mã <strong>VietQR Napas 24/7</strong> với số tiền và cú
      pháp chính xác. Bạn chỉ cần mở app ngân hàng bất kỳ để quét mã và chuyển khoản nhanh trong 30 giây.
    </p>
  </div>
);

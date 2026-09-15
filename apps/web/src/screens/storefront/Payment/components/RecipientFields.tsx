import { CheckoutField } from "./CheckoutField";
import { CheckoutSection } from "./CheckoutSection";

export const RecipientFields = () => (
  <CheckoutSection step={1} title="Thông Tin Người Nhận">
    <CheckoutField label="Họ và tên người nhận" name="fullName" placeholder="Ví dụ: Nguyễn Văn A" required />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CheckoutField label="Số điện thoại" name="phone" placeholder="0912 345 678" type="tel" required />
      <CheckoutField label="Email (nhận hóa đơn & cập nhật)" name="email" placeholder="email@example.com" type="email" />
    </div>
  </CheckoutSection>
);

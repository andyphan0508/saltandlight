"use client";

import type { PaymentMethodValue } from "@saltandlight/domain";
import { Check, ShieldCheck, Truck } from "@/components/Icons";
import { CheckoutSection } from "./CheckoutSection";

const OPTIONS: { value: PaymentMethodValue; title: string; description: string; icon: typeof Truck }[] = [
  {
    value: "bank_transfer",
    title: "Chuyển khoản ngân hàng",
    description: "Sau khi xác nhận, hiện mã VietQR đúng số tiền và nội dung — quét bằng app ngân hàng bất kỳ.",
    icon: ShieldCheck,
  },
  {
    value: "cod",
    title: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt cho shipper khi nhận hàng. Shop gọi xác nhận trước khi giao.",
    icon: Truck,
  },
];

interface PaymentMethodPickerProps {
  value: PaymentMethodValue;
  onChange: (value: PaymentMethodValue) => void;
}

/** Two native radios styled as cards — keyboard arrows and screen readers work without extra code. */
export const PaymentMethodPicker = ({ value, onChange }: PaymentMethodPickerProps) => (
  <CheckoutSection step={3} title="Phương Thức Thanh Toán">
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">Chọn phương thức thanh toán</legend>
      {OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;
        return (
          <label
            key={option.value}
            className={`relative flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-forest/40 ${
              isSelected ? "border-brand-forest bg-mint-50/60 shadow-sm" : "border-ink/10 bg-white hover:border-ink/25"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                isSelected ? "bg-brand-forest text-white" : "bg-mint-100 text-brand-forest"
              }`}
            >
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-ink">{option.title}</span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-ink/60">{option.description}</span>
            </span>
            <span
              aria-hidden="true"
              className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                isSelected ? "border-brand-forest bg-brand-forest text-white" : "border-ink/20"
              }`}
            >
              {isSelected && <Check size={12} />}
            </span>
          </label>
        );
      })}
    </fieldset>
  </CheckoutSection>
);

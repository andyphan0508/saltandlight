"use client";

import { CheckoutField } from "./CheckoutField";
import { CheckoutSection } from "./CheckoutSection";
import { WardSearchInput, type LocationValue } from "./WardSearchInput";

interface ShippingAddressFieldsProps {
  location: LocationValue;
  onLocationChange: (location: LocationValue) => void;
}

/** Ward + province search, street address and an optional note for the shipper. */
export const ShippingAddressFields = ({ location, onLocationChange }: ShippingAddressFieldsProps) => (
  <CheckoutSection step={2} title="Địa Chỉ Giao Hàng">
    <WardSearchInput value={location} onChange={onLocationChange} />
    <CheckoutField
      label="Địa chỉ cụ thể (số nhà, tên đường, tòa nhà)"
      name="streetAddress"
      placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
      required
    />
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-ink/70">Ghi chú cho shipper / Shop (Tùy chọn)</label>
      <textarea
        name="note"
        rows={2}
        placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
        className="mt-1.5 w-full rounded-2xl border border-ink/15 p-3 text-sm focus:border-ink focus:outline-none"
      />
    </div>
  </CheckoutSection>
);

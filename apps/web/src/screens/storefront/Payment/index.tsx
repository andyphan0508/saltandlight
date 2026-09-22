"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { formatVND, type PaymentMethodValue } from "@saltandlight/domain";
import { useCheckoutQuote } from "@/hooks/use-checkout-quote";
import { useCartStore } from "@/stores/cart-store";
import { track } from "@/helpers/analytics/client";
import { useStoreHydrated } from "@/stores/use-store-hydrated";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutLoading } from "./components/CheckoutLoading";
import { EmptyCheckout } from "./components/EmptyCheckout";
import type { LocationValue } from "./components/WardSearchInput";
import { OrderSummary } from "./components/OrderSummary";
import { PaymentMethodPicker } from "./components/PaymentMethodPicker";
import { RecipientFields } from "./components/RecipientFields";
import { ShippingAddressFields } from "./components/ShippingAddressFields";

const EMPTY_LOCATION: LocationValue = { provinceCode: null, province: "", wardCode: null, ward: "" };

// The API sends a Vietnamese message as a string, or a validation object that is not meant for customers
const toOrderErrorMessage = (error: unknown) =>
  typeof error === "string" && error ? error : "Vui lòng kiểm tra lại thông tin người nhận và địa chỉ giao hàng.";

export const CheckoutView = () => {
  const router = useRouter();
  const cartLines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const isHydrated = useStoreHydrated(useCartStore);
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("bank_transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quote = useCheckoutQuote(cartLines, location.provinceCode);
  const hasTrackedCheckout = useRef(false);

  // Once per visit to checkout, as soon as the cart is known to be non-empty
  useEffect(() => {
    if (!isHydrated || cartLines.length === 0 || hasTrackedCheckout.current) return;
    hasTrackedCheckout.current = true;
    track("checkout_start", { quantity: cartLines.reduce((sum, line) => sum + line.quantity, 0) });
  }, [isHydrated, cartLines]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    const field = (name: string) => String(form.get(name) || "");

    const payload = {
      customer: { fullName: field("fullName"), phone: field("phone"), email: field("email") },
      shippingAddress: {
        recipientName: field("fullName"),
        phone: field("phone"),
        province: location.province,
        provinceCode: location.provinceCode,
        ward: location.ward,
        wardCode: location.wardCode,
        streetAddress: field("streetAddress"),
      },
      note: field("note"),
      items: cartLines,
      paymentMethod,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(toOrderErrorMessage(data.error));
        setIsSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/don-hang/${encodeURIComponent(data.orderNumber)}`);
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) return <CheckoutLoading />;
  if (cartLines.length === 0) return <EmptyCheckout />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8 animate-slide-up-fade">
      <CheckoutHeader />

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <form onSubmit={onSubmit} className="space-y-6 lg:col-span-7">
          <RecipientFields />
          <ShippingAddressFields location={location} onLocationChange={setLocation} />
          <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

          {error && <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-sm font-semibold text-sale">{error}</div>}

          <Button type="submit" disabled={isSubmitting} variant="primary" size="lg" className="w-full shadow-lg hover:shadow-xl py-4">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý đơn hàng…
              </span>
            ) : (
              <span className="flex flex-col items-center leading-tight">
                <span>Xác nhận</span>
                {quote && (
                  <span className="mt-0.5 text-[11px] font-medium opacity-80">
                    {formatVND(quote.total)} · {paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản ngân hàng"}
                  </span>
                )}
              </span>
            )}
          </Button>
        </form>

        <OrderSummary quote={quote} />
      </div>
    </div>
  );
};

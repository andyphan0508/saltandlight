import { useEffect, useState } from "react";
import { fetchWithRetry } from "@/api/fetch-with-retry";
import type { CheckoutQuote } from "@/interfaces/checkout";
import type { CartLine } from "@/stores/cart-store";

/** Server-priced cart for the chosen province (shipping depends on it); retries so a cold start doesn't blank the summary. */
export const useCheckoutQuote = (items: CartLine[], provinceCode: number | null) => {
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    fetchWithRetry("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, ...(provinceCode != null ? { provinceCode } : {}) }),
      retries: 2,
      retryDelayMs: 1000,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setQuote(data);
      })
      .catch((err) => console.warn("Checkout quote fetch error:", err));
  }, [items, provinceCode]);

  return quote;
};

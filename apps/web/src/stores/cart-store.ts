"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeLocalStorage } from "@/helpers/safe-storage";

export interface CartLine {
  productVariantId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  /** Applied coupon code, carried from the cart to checkout; the server decides what it's worth. */
  couponCode: string;
  setCouponCode: (code: string) => void;
  add: (productVariantId: string, quantity?: number) => void;
  remove: (productVariantId: string) => void;
  setQuantity: (productVariantId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      couponCode: "",
      setCouponCode: (couponCode) => set({ couponCode }),
      add: (productVariantId, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productVariantId === productVariantId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productVariantId === productVariantId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { productVariantId, quantity }] };
        }),
      remove: (productVariantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productVariantId !== productVariantId),
        })),
      setQuantity: (productVariantId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.productVariantId !== productVariantId)
              : state.lines.map((l) =>
                  l.productVariantId === productVariantId ? { ...l, quantity } : l,
                ),
        })),
      // An order was placed: the code is spent, so it goes with the items
      clear: () => set({ lines: [], couponCode: "" }),
    }),
    {
      name: "sl-cart",
      storage: safeLocalStorage,
    },
  ),
);

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeLocalStorage } from "@/helpers/safe-storage";
import { track } from "@/helpers/analytics/client";

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) => {
        const isAdding = !get().productIds.includes(productId);
        set((state) => ({
          productIds: isAdding ? [...state.productIds, productId] : state.productIds.filter((id) => id !== productId),
        }));
        // Every heart (card, list row, product page) goes through here; only a save counts
        if (isAdding) track("wishlist_add", { productId });
      },
      has: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "sl-wishlist",
      storage: safeLocalStorage,
    },
  ),
);

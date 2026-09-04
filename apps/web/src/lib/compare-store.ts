"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeLocalStorage } from "./safe-storage";

const MAX_COMPARE = 4;

interface CompareState {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => {
          if (state.productIds.includes(productId)) {
            return { productIds: state.productIds.filter((id) => id !== productId) };
          }
          if (state.productIds.length >= MAX_COMPARE) return state;
          return { productIds: [...state.productIds, productId] };
        }),
      has: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "sl-compare",
      storage: safeLocalStorage,
    },
  ),
);

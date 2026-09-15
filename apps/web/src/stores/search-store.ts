"use client";

import { create } from "zustand";

interface SearchModalState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

/** Shared between Header's search triggers (desktop + mobile) and SearchSpotlight. */
export const useSearchModalStore = create<SearchModalState>()((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
}));

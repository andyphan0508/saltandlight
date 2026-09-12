"use client";

import { create } from "zustand";

interface SearchModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/** Shared between Header's search triggers (desktop + mobile) and SearchSpotlight. */
export const useSearchModalStore = create<SearchModalState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

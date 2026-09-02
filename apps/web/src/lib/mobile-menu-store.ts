"use client";

import { create } from "zustand";

interface MobileMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * Shared between Header (which renders the drawer) and BottomTabBar (whose
 * "Menu" tab opens it) — the two live as siblings outside <header> so
 * BottomTabBar's `position: fixed` isn't contained by header's
 * `backdrop-filter` (see Header.tsx), so they can't share local state.
 */
export const useMobileMenuStore = create<MobileMenuState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

"use client";

import { useEffect, useRef } from "react";

// If a tab sits backgrounded/frozen (bfcache) longer than this, its in-memory
// Next.js router tree is treated as stale on return and gets a fresh reload
// instead of risking a "parallelRoutes" crash on the next navigation. Short
// backgrounding (quick tab-switch, app-switch on mobile) stays instant.
const STALE_AFTER_MS = 5 * 60 * 1000;

/** Mount once near the app root. Renders nothing. */
export const BfcacheReload = () => {
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
      }
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const hiddenAt = hiddenAtRef.current;
      const idleMs = hiddenAt ? Date.now() - hiddenAt : Infinity;
      if (idleMs > STALE_AFTER_MS) {
        window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
};

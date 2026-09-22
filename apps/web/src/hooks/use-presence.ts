"use client";

import { useEffect, useState } from "react";

/**
 * Keeps an overlay mounted for `exitMs` after it closes, so it can play a closing
 * animation instead of vanishing in one frame. `isClosing` is true during that time.
 * With reduced motion it unmounts at once.
 */
export const usePresence = (isOpen: boolean, exitMs = 220) => {
  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setIsMounted(false), isReduced ? 0 : exitMs);
    return () => clearTimeout(timer);
  }, [isOpen, exitMs]);

  return { isMounted: isOpen || isMounted, isClosing: !isOpen && isMounted };
};

"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {}
});

export const useGlobalLoader = () => useContext(LoadingContext);

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = () => {
    setIsLoading(true);
    setProgress(20);
  };

  const stopLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 250);
  };

  // Reset loading whenever pathname or searchParams change
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Safety timeout: never let loading stay on for more than 3.5s
  useEffect(() => {
    if (!isLoading) return;
    const safety = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 3500);
    return () => clearTimeout(safety);
  }, [isLoading]);

  // Progress animation while loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && progress < 90) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const diff = Math.random() * 10 + 5;
          return Math.min(prev + diff, 90);
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isLoading, progress]);

  // Intercept internal link clicks for instant feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("//") &&
        targetAttr !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const currentFull = window.location.pathname + window.location.search;
        if (href === currentFull) return;
        startLoading();
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-mint-300 via-brand-forest to-emerald-500 shadow-[0_0_10px_rgba(31,92,63,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isLoading || progress > 0 ? 1 : 0,
        }}
      />
    </div>
  );
}

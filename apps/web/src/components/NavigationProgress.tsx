"use client";

import React, {
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { CrossIcon } from "./Icons";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useGlobalLoader = () => useContext(LoadingContext);

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Đang tải dữ liệu...");

  const startLoading = (text = "Đang tải dữ liệu...") => {
    setLoadingText(text);
    setIsLoading(true);
    setProgress(15);
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
    if (isLoading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isLoading]);

  // Progress animation while loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && progress < 85) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          const diff = Math.random() * 12 + 6;
          return Math.min(prev + diff, 85);
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isLoading, progress]);

  // Intercept all internal <a> tag clicks for instant responsive feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      // Check if valid internal navigation
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
        // If clicking on current path without query change, skip
        const currentFull = window.location.pathname + window.location.search;
        if (href === currentFull) return;

        startLoading("Đang mở trang...");
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleAnchorClick, {
        capture: true,
      });
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* 1. Top Loading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-[3.5px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-mint-300 via-brand-forest to-emerald-500 shadow-[0_0_14px_rgba(31,92,63,0.9)] transition-all duration-200 ease-out"
          style={{
            width: `${progress}%`,
            opacity: isLoading || progress > 0 ? 1 : 0,
          }}
        />
      </div>

      {/* 2. Soft Backdrop Blur & Centered Bouncing Spinner Widget */}
      {isLoading && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-cream/75 backdrop-blur-[4px] transition-all duration-300 animate-in fade-in select-none">
          <div className="flex flex-col items-center gap-5 rounded-3xl bg-white/95 px-9 py-8 shadow-card-hover border border-mint-200/90 max-w-xs text-center backdrop-blur-md">
            {/* Bouncing Spinner Graphic Container */}
            <div className="relative flex h-20 w-20 items-center justify-center animate-bounce-soft">
              {/* Outer Dashed Rotating Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-mint-300 animate-spin" />

              {/* Inner Glowing Fast Spinner */}
              <div className="absolute inset-1.5 rounded-full border-3 border-transparent border-t-brand-forest border-r-emerald-600 animate-spin" />

              {/* Center Logo Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-md transition-transform">
                <CrossIcon size={20} className="text-mint-200 animate-pulse" />
              </div>
            </div>

            {/* Brand Logo & Status Message */}
            <div className="space-y-1.5 flex flex-col items-center">
              <div className="relative h-8 w-32">
                <Image
                  src="/images/logo.png"
                  alt="Salt & Light"
                  fill
                  sizes="128px"
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-brand-forest block">
                {loadingText}
              </span>
            </div>

            {/* Staggered Bouncing Dots Loader */}
            <div className="flex items-center gap-2 pt-1">
              <span className="h-2 w-2 rounded-full bg-brand-forest animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-mint-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

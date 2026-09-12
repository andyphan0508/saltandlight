"use client";

import React, {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
  useCallback,
  Suspense,
} from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationBufferContextType {
  isBuffering: boolean;
  startBuffer: (message?: string) => void;
  stopBuffer: () => void;
}

const NavigationBufferContext = createContext<NavigationBufferContextType>({
  isBuffering: false,
  startBuffer: () => {},
  stopBuffer: () => {},
});

export const useNavigationBuffer = () => useContext(NavigationBufferContext);

const NavigationBufferInner = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bufferText, setBufferText] = useState("Đang tải trang...");

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prevPathRef = useRef(pathname);
  const prevParamsRef = useRef(searchParams?.toString());

  const onStopBuffer = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setProgress(100);
    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
    bufferTimerRef.current = setTimeout(() => {
      setIsBuffering(false);
      setProgress(0);
    }, 180);
  }, []);

  const onStartBuffer = useCallback(
    (text = "Đang tải trang...") => {
      setBufferText(text);
      setIsBuffering(true);
      setProgress(25);

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 94) return prev;
          if (prev < 75) {
            const step = Math.random() * 8 + 6;
            return Math.min(prev + step, 75);
          }
          if (prev < 88) {
            const step = Math.random() * 4 + 2;
            return Math.min(prev + step, 88);
          }
          // During service cold boot / slower wait, smoothly crawl up to 94%
          return Math.min(prev + 0.6, 94);
        });
      }, 180);

      // Buffer safety timer: 10s gives enough buffer for Cloudflare/DB cold boot
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => {
        onStopBuffer();
      }, 10000);
    },
    [onStopBuffer]
  );

  // When pathname or searchParams ACTUALLY change, the destination route mounted:
  // finish progress and dismiss smoothly
  useEffect(() => {
    const currentParams = searchParams?.toString();
    const hasPathChanged = pathname !== prevPathRef.current;
    const hasParamsChanged = currentParams !== prevParamsRef.current;

    if (hasPathChanged || hasParamsChanged) {
      prevPathRef.current = pathname;
      prevParamsRef.current = currentParams;
      onStopBuffer();
    }
  }, [pathname, searchParams, onStopBuffer]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  // Intercept internal link clicks with rapid-click debouncing
  useEffect(() => {
    const onAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      // Validate internal storefront link
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
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const targetClean = href.split("#")[0];

        // Ignore clicking on the exact current path and search
        if (targetClean === currentPath + currentSearch || targetClean === currentPath) {
          return;
        }

        onStartBuffer("Đang mở trang...");
      }
    };

    document.addEventListener("click", onAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", onAnchorClick, { capture: true });
    };
  }, [onStartBuffer]);

  if (!isBuffering && progress === 0) return null;

  return (
    <NavigationBufferContext.Provider value={{ isBuffering, startBuffer: onStartBuffer, stopBuffer: onStopBuffer }}>
      {/* 1. Top Loading Progress Bar - ALWAYS non-blocking */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-[3.5px] bg-transparent pointer-events-none select-none">
        <div
          className="h-full bg-gradient-to-r from-mint-300 via-brand-forest to-emerald-500 shadow-[0_0_14px_rgba(31,92,63,0.9)] transition-all duration-200 ease-out"
          style={{
            width: `${progress}%`,
            opacity: isBuffering || progress > 0 ? 1 : 0,
          }}
        />
      </div>

      {/* 2. Floating Buffer Badge - ALWAYS pointer-events-none so it NEVER blocks user clicks */}
      {isBuffering && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none select-none transition-all duration-300 ${
            progress === 100 ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0 animate-pop-in"
          }`}
        >
          <div className="flex items-center gap-3 rounded-full bg-white/95 px-5 py-2.5 shadow-2xl border border-mint-200/90 backdrop-blur-md">
            {/* Animated Logo Icon */}
            <div className="relative flex h-7 w-7 items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-mint-300 animate-spin-slow" />
              <div className="absolute inset-0.5 rounded-full border-[2px] border-transparent border-t-brand-forest border-r-emerald-500 animate-spin" />
              <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white overflow-hidden p-0.5">
                <Image
                  src="/images/logo-emblem.webp"
                  alt="Salt & Light"
                  fill
                  sizes="20px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Label and bouncing dots */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink tracking-tight">
                {bufferText}
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-forest animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-mint-400 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      )}
    </NavigationBufferContext.Provider>
  );
};

export const NavigationBuffer = () => {
  return (
    <Suspense fallback={null}>
      <NavigationBufferInner />
    </Suspense>
  );
};

export default NavigationBuffer;

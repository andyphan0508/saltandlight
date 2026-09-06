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

function NavigationBufferInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bufferText, setBufferText] = useState("Đang tải dữ liệu...");

  const lastNavTimeRef = useRef<number>(0);
  const pendingTargetRef = useRef<string | null>(null);
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopBuffer = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setProgress(100);
    // Buffer window (200ms) gives the newly rendered page time to settle DOM & layout
    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
    bufferTimerRef.current = setTimeout(() => {
      setIsBuffering(false);
      setProgress(0);
      pendingTargetRef.current = null;
    }, 220);
  }, []);

  const startBuffer = useCallback(
    (text = "Đang tải dữ liệu...") => {
      setBufferText(text);
      setIsBuffering(true);
      setProgress(20);

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          const step = Math.random() * 8 + 4;
          return Math.min(prev + step, 85);
        });
      }, 180);

      // Safety timeout: dismiss after 5.5s in case of an unhandled navigation abort
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => {
        stopBuffer();
      }, 5500);
    },
    [stopBuffer]
  );

  // When pathname or searchParams update, the new route has mounted:
  // complete progress and smoothly dismiss the buffer
  useEffect(() => {
    if (isBuffering) {
      stopBuffer();
    }
  }, [pathname, searchParams, isBuffering, stopBuffer]);

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
    const handleAnchorClick = (e: MouseEvent) => {
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
        const currentFull = window.location.pathname + window.location.search;
        // Ignore clicking the exact same current URL
        if (href === currentFull) return;

        const now = Date.now();
        // Rapid-click guard: if user clicks rapidly, update the destination target
        // without spawning conflicting timers
        lastNavTimeRef.current = now;
        pendingTargetRef.current = href;

        startBuffer("Đang mở trang...");
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, [startBuffer]);

  if (!isBuffering && progress === 0) return null;

  return (
    <NavigationBufferContext.Provider value={{ isBuffering, startBuffer, stopBuffer }}>
      {/* 1. Top Loading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-[3.5px] bg-transparent pointer-events-none select-none">
        <div
          className="h-full bg-gradient-to-r from-mint-300 via-brand-forest to-emerald-500 shadow-[0_0_16px_rgba(31,92,63,0.85)] transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            opacity: isBuffering || progress > 0 ? 1 : 0,
          }}
        />
      </div>

      {/* 2. Soft Navigation Buffer Overlay ("loading xong sẽ hiển thị") */}
      {isBuffering && (
        <div
          className={`fixed inset-0 z-[9990] flex items-center justify-center bg-cream/70 backdrop-blur-[5px] transition-opacity duration-300 select-none ${
            progress === 100 ? "opacity-0 pointer-events-none" : "opacity-100 animate-in fade-in"
          }`}
        >
          <div className="flex flex-col items-center gap-5 rounded-3xl bg-white/95 px-8 py-7 shadow-card-hover border border-mint-200/90 max-w-xs text-center backdrop-blur-md animate-pop-in">
            {/* Animated Logo Container */}
            <div className="relative flex h-24 w-24 items-center justify-center animate-bounce-soft">
              {/* Outer Slow Rotating Dashed Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-mint-300 animate-spin-slow" />

              {/* Glowing Inner Spinner Ring */}
              <div className="absolute inset-1.5 rounded-full border-[2.5px] border-transparent border-t-brand-forest border-r-emerald-500 animate-spin" />

              {/* Center Emblem Logo */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm overflow-hidden p-1.5 border border-mint-200">
                <Image
                  src="/images/logo-emblem.webp"
                  alt="Salt & Light"
                  fill
                  sizes="64px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Brand Title & Status Message */}
            <div className="space-y-1 flex flex-col items-center">
              <span className="font-display text-sm font-black uppercase tracking-widest text-ink block">
                Salt &amp; Light
              </span>
              <span className="text-xs font-semibold text-brand-forest block">
                {bufferText}
              </span>
            </div>

            {/* Cute Staggered Bouncing Dots Loader */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="h-2 w-2 rounded-full bg-brand-forest animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-mint-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </NavigationBufferContext.Provider>
  );
}

export function NavigationBuffer() {
  return (
    <Suspense fallback={null}>
      <NavigationBufferInner />
    </Suspense>
  );
}

export default NavigationBuffer;

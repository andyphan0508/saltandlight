"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { flush, isTrackingDisabled, track } from "@/helpers/analytics/client";

/**
 * Page views and how long each page was actually looked at. Visible time is
 * counted in slices — a slice ends when the tab is hidden or the visitor
 * navigates — and each slice is sent as a page_leave, so the dashboard sums
 * them for time on site and uses them to tell a bounce from a real visit.
 */
export const AnalyticsTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = useRef({ path: "", visibleSince: 0, maxScroll: 0 });

  const endSlice = () => {
    const current = page.current;
    if (!current.path || current.visibleSince === 0) return;
    track("page_leave", {
      path: current.path,
      durationMs: Math.min(Date.now() - current.visibleSince, 3_600_000),
      scroll: Math.round(current.maxScroll),
    });
    current.visibleSince = 0;
  };

  // New page: close the previous page's slice, record the view, send both together
  useEffect(() => {
    if (isTrackingDisabled()) return;
    endSlice();
    page.current = { path: pathname, visibleSince: document.visibilityState === "visible" ? Date.now() : 0, maxScroll: 0 };
    track("page_view", { path: pathname });
    flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isTrackingDisabled()) return;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
      page.current.maxScroll = Math.max(page.current.maxScroll, Math.min(percent, 100));
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        endSlice();
        flush();
      } else if (page.current.visibleSince === 0) {
        page.current.visibleSince = Date.now();
      }
    };
    const onPageHide = () => {
      endSlice();
      flush();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

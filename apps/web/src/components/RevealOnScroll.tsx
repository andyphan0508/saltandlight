"use client";

import { useEffect } from "react";

/**
 * Fades `[data-reveal]` elements up as they scroll into view (CSS in globals.css), for
 * browsers without scroll-driven animations; the rest do it in CSS alone.
 * Nothing is hidden until this runs, so without JS every section simply shows; what
 * the server already painted in view on first load is left alone rather than
 * blinking out and back in. Sections added later (client navigation, filters, load
 * more) are picked up by the MutationObserver.
 */
export const RevealOnScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Scroll-driven CSS does it off the main thread where supported (globals.css)
    if (CSS.supports("animation-timeline: view()")) return;

    // "static": was already painted in view, so it shows without the entrance animation
    const show = (el: Element, how: "animate" | "static" = "animate") => el.setAttribute("data-inview", how);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const watch = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not([data-inview])").forEach((el) => io.observe(el));
    };

    // Already on screen at hydration: keep as painted
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el, "static");
    });
    document.documentElement.setAttribute("data-reveal-ready", "");
    watch(document);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]:not([data-inview])")) io.observe(node);
          watch(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      document.documentElement.removeAttribute("data-reveal-ready");
    };
  }, []);

  return null;
};

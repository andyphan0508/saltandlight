import { Be_Vietnam_Pro, Fraunces } from "next/font/google";

/** Editorial serif for headlines, only on this landing page; both carry the Vietnamese subset. */
export const displayFont = Fraunces({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  display: "swap",
});

export const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-brand-forest px-6 py-3.5 text-sm font-semibold text-cream shadow-[0_14px_28px_-14px_rgba(19,62,43,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-mint-700 active:translate-y-0 active:scale-[0.98]";

export const GHOST_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/40 hover:bg-white active:translate-y-0 active:scale-[0.98]";

export const Eyebrow = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-forest/70 ${className}`}>{children}</p>
);

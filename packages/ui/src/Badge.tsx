import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type Tone = "new" | "sale" | "neutral" | "success" | "warning" | "danger" | "gold" | "mint";

const toneClasses: Record<Tone, string> = {
  new: "bg-brand-new text-white shadow-sm shadow-brand-new/20",
  sale: "bg-sale text-white shadow-sm shadow-sale/20 font-extrabold",
  neutral: "bg-ink-100 text-ink-800 border border-ink/10",
  success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border border-amber-200",
  danger: "bg-rose-50 text-rose-800 border border-rose-200",
  gold: "bg-gold-50 text-gold-900 border border-gold-200 font-bold",
  mint: "bg-mint-100 text-brand-forest border border-mint-200 font-bold",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider select-none",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

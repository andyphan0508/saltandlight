import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "sale" | "accent";
type Size = "sm" | "md" | "lg" | "xl";

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-800 shadow-sm hover:shadow active:scale-[0.98]",
  secondary: "bg-mint-100 text-brand-forest hover:bg-mint-200 active:scale-[0.98]",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white active:scale-[0.98]",
  ghost: "text-ink hover:bg-ink/5 active:scale-[0.98]",
  sale: "bg-sale text-white hover:bg-sale-dark shadow-sm hover:shadow active:scale-[0.98]",
  accent: "bg-brand-new text-white hover:bg-brand-forest shadow-sm hover:shadow active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3.5 py-2 font-semibold",
  md: "text-sm px-5 py-2.5 font-semibold",
  lg: "text-sm px-7 py-3.5 font-bold",
  xl: "text-base px-8 py-4 font-bold tracking-wide",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-pill tracking-wider transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

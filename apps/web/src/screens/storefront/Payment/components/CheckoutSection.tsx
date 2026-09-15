import type { ReactNode } from "react";

interface CheckoutSectionProps {
  step: number;
  title: string;
  children: ReactNode;
}

/** White checkout card with a numbered step heading. */
export const CheckoutSection = ({ step, title, children }: CheckoutSectionProps) => (
  <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 space-y-6">
    <h2 className="font-display text-base font-bold uppercase text-ink flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint-200 text-xs text-brand-forest">{step}</span>
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

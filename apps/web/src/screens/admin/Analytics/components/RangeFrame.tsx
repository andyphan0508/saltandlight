"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ANALYTICS_RANGES, type AnalyticsRangeId } from "@/helpers/analytics/ranges";

/**
 * The period picker stays within thumb reach while the long page scrolls, and a pick
 * answers at once: the chosen pill moves straight away and the figures below dim until
 * the new ones arrive (a report takes a second or two), instead of a dead tap. The old
 * figures stay in place meanwhile, so nothing jumps.
 */
export const RangeFrame = ({ rangeId, children }: { rangeId: AnalyticsRangeId; children: ReactNode }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [picked, setPicked] = useState(rangeId);
  const active = isPending ? picked : rangeId;

  const onPick = (id: AnalyticsRangeId) => {
    if (id === active) return;
    setPicked(id);
    startTransition(() => router.push(`/admin/analytics?range=${id}`, { scroll: false }));
  };

  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 bg-[#f8f9fa]/85 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
        <nav
          aria-label="Khoảng thời gian"
          className="grid grid-cols-4 gap-1 rounded-full bg-slate-900/[0.05] p-1 ring-1 ring-slate-900/[0.04] sm:inline-grid"
        >
          {ANALYTICS_RANGES.map((range) => {
            const isActive = range.id === active;
            return (
              <button
                key={range.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onPick(range.id)}
                className={`relative rounded-full px-3 py-2 text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] sm:px-5 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_6px_16px_-8px_rgba(15,23,42,0.18)]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        aria-busy={isPending}
        className={`space-y-5 transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:space-y-6 ${isPending ? "opacity-[0.45]" : ""}`}
      >
        {children}
      </div>
    </>
  );
};

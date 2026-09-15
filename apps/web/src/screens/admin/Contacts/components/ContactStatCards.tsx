"use client";

import type { ContactCounts, ContactStatus } from "@/interfaces/contact";

const CARDS: { status: ContactStatus; title: string; activeClass: string; titleClass: string; countClass: string }[] = [
  {
    status: "new",
    title: "Yêu cầu mới chưa xử lý",
    activeClass: "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs",
    titleClass: "text-amber-800",
    countClass: "bg-amber-100 text-amber-800",
  },
  {
    status: "in_progress",
    title: "Đang hỗ trợ / Xử lý",
    activeClass: "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-xs",
    titleClass: "text-blue-800",
    countClass: "bg-blue-100 text-blue-800",
  },
  {
    status: "closed",
    title: "Đã hoàn tất",
    activeClass: "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs",
    titleClass: "text-emerald-800",
    countClass: "bg-emerald-100 text-emerald-800",
  },
];

interface ContactStatCardsProps {
  counts: ContactCounts;
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

/** Per-status counters that double as a status filter toggle. */
export const ContactStatCards = ({ counts, activeStatus, onStatusChange }: ContactStatCardsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {CARDS.map((card) => {
      const isActive = activeStatus === card.status;
      return (
        <button
          key={card.status}
          type="button"
          onClick={() => onStatusChange(isActive ? "all" : card.status)}
          className={`rounded-2xl p-4 sm:p-5 border text-left transition-all ${
            isActive ? card.activeClass : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${card.titleClass}`}>{card.title}</span>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${card.countClass}`}>
              {counts[card.status]}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{counts[card.status]}</div>
        </button>
      );
    })}
  </div>
);

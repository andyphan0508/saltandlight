"use client";

import { useEffect, useState } from "react";
import { Search, X } from "@/components/admin/Icons";
import type { ContactCounts, ContactFilters } from "@/interfaces/contact";

interface ContactFilterBarProps {
  filters: ContactFilters;
  counts: ContactCounts;
  onFilter: (filters: ContactFilters) => void;
}

const selectClass =
  "rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none";

/** Search box (submits on Enter) plus status and request-type selects. */
export const ContactFilterBar = ({ filters, counts, onFilter }: ContactFilterBarProps) => {
  const [search, setSearch] = useState(filters.q);

  useEffect(() => {
    setSearch(filters.q);
  }, [filters.q]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-2xl bg-white p-3 border border-slate-200/80 shadow-xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onFilter({ ...filters, q: search });
        }}
        className="flex flex-1 items-center gap-2"
      >
        <Search size={16} className="text-slate-400 ml-2 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo họ tên, số điện thoại, email hoặc nội dung tin nhắn… (nhấn Enter)"
          className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
        />
        {search && (
          <button
            type="button"
            aria-label="Xoá tìm kiếm"
            onClick={() => {
              setSearch("");
              onFilter({ ...filters, q: "" });
            }}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <select value={filters.status} onChange={(e) => onFilter({ ...filters, q: search, status: e.target.value })} className={selectClass}>
          <option value="all">Tất cả trạng thái ({counts.all})</option>
          <option value="new">Chưa xử lý ({counts.new})</option>
          <option value="in_progress">Đang xử lý ({counts.in_progress})</option>
          <option value="closed">Đã hoàn tất ({counts.closed})</option>
        </select>

        <select value={filters.type} onChange={(e) => onFilter({ ...filters, q: search, type: e.target.value })} className={selectClass}>
          <option value="all">Tất cả loại yêu cầu</option>
          <option value="contact">Liên hệ tư vấn chung</option>
          <option value="custom_order">Đặt in áo / quà tặng theo yêu cầu</option>
        </select>
      </div>
    </div>
  );
};

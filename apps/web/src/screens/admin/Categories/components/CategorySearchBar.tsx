"use client";

import { useEffect, useState } from "react";
import { Search, X } from "@/components/admin/Icons";

interface CategorySearchBarProps {
  query: string;
  onSearch: (query: string) => void;
}

/** Search by name, slug or parent; submits on Enter. */
export const CategorySearchBar = ({ query, onSearch }: CategorySearchBarProps) => {
  const [search, setSearch] = useState(query);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(search);
      }}
      className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-slate-200/80 shadow-xs"
    >
      <Search size={18} className="text-slate-400 ml-2" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm danh mục theo tên, đường dẫn (slug) hoặc danh mục cha… (nhấn Enter)"
        className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
      />
      {search && (
        <button
          type="button"
          aria-label="Xoá tìm kiếm"
          onClick={() => {
            setSearch("");
            onSearch("");
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
};

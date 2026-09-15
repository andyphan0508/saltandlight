"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryOption } from "@/interfaces/catalog";
import { ChevronDown } from "../Icons";

/** "Danh mục" menu listing every category; closes on outside click and on navigation. */
export const CategoryDropdown = ({ categories }: { categories: CategoryOption[] }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isSectionActive = pathname.startsWith("/san-pham") || pathname.startsWith("/danh-muc");

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onClose = () => setIsOpen(false);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-3 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
          isSectionActive && !isOpen ? "bg-ink text-white shadow-sm" : "text-ink/85 hover:bg-ink/5 hover:text-ink"
        }`}
        aria-expanded={isOpen}
      >
        Danh mục
        <ChevronDown size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-ink/10 bg-white p-2 shadow-xl animate-fade-in">
          <Link href="/san-pham" onClick={onClose} className="block rounded-xl px-3 py-2 text-xs font-bold uppercase text-ink hover:bg-mint-50">
            Tất cả sản phẩm
          </Link>
          <div className="my-1 border-t border-ink/5" />
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/san-pham?categories=${category.slug}`}
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink/75 hover:bg-mint-50 hover:text-ink"
            >
              <span>{category.name}</span>
              <span className="text-[10px] text-ink/35">{category.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

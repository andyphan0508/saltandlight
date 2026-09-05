"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  Sparkles,
} from "./Icons";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const SORT_OPTIONS = [
  { value: "latest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp đến cao" },
  { value: "price-desc", label: "Giá: Cao đến thấp" },
  { value: "name-asc", label: "Tên: A-Z" },
] as const;

function parseList(param: string | null): string[] {
  return param ? param.split(",").filter(Boolean) : [];
}

export function ProductFilters({
  categories,
  sizes,
  totalCount,
}: {
  categories: CategoryOption[];
  sizes: string[];
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Desktop accordions
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [sizesOpen, setSizesOpen] = useState(true);

  // Mobile BottomSheet state
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  const activeCategories = parseList(searchParams.get("categories"));
  const activeSizes = parseList(searchParams.get("sizes"));
  const onSale = searchParams.get("onSale") === "1";
  const activeSort = searchParams.get("sort") ?? "latest";

  const currentSortObj = SORT_OPTIONS.find((s) => s.value === activeSort) ?? SORT_OPTIONS[0];

  // Total active filter count (excluding default sort)
  const activeFilterCount =
    activeCategories.length +
    activeSizes.length +
    (onSale ? 1 : 0) +
    (activeSort !== "latest" ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  // Lock body scroll when mobile filter sheet is open
  useEffect(() => {
    if (bottomSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [bottomSheetOpen]);

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleCategory(slug: string) {
    updateParams((params) => {
      const next = activeCategories.includes(slug)
        ? activeCategories.filter((s) => s !== slug)
        : [...activeCategories, slug];
      if (next.length) params.set("categories", next.join(","));
      else params.delete("categories");
    });
  }

  function setSingleCategory(slug: string | null) {
    updateParams((params) => {
      if (slug) params.set("categories", slug);
      else params.delete("categories");
    });
  }

  function toggleSize(size: string) {
    updateParams((params) => {
      const next = activeSizes.includes(size)
        ? activeSizes.filter((s) => s !== size)
        : [...activeSizes, size];
      if (next.length) params.set("sizes", next.join(","));
      else params.delete("sizes");
    });
  }

  function toggleOnSale() {
    updateParams((params) => {
      if (onSale) params.delete("onSale");
      else params.set("onSale", "1");
    });
  }

  function setSort(sortValue: string) {
    updateParams((params) => {
      if (sortValue === "latest") params.delete("sort");
      else params.set("sort", sortValue);
    });
  }

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE EXPERIENCE (lg:hidden): Compact horizontal bar + Native BottomSheet */}
      {/* ========================================================================= */}
      <div className="block lg:hidden w-full space-y-3 mb-2">
        {/* Row 1: Horizontal Category Selection Pills */}
        <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-1 -mx-4 px-4">
          <button
            type="button"
            onClick={() => setSingleCategory(null)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active-press ${
              activeCategories.length === 0
                ? "bg-ink text-white shadow-sm"
                : "bg-white border border-ink/10 text-ink/75 hover:bg-ink/5"
            }`}
          >
            <span>Tất cả</span>
            <span className={`text-[10px] ${activeCategories.length === 0 ? "text-white/60" : "text-ink/40"}`}>
              ({totalCount})
            </span>
          </button>

          {categories.map((c) => {
            const isSelected = activeCategories.includes(c.slug);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSingleCategory(isSelected && activeCategories.length === 1 ? null : c.slug)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all active-press ${
                  isSelected
                    ? "bg-brand-forest text-white shadow-sm"
                    : "bg-white border border-ink/10 text-ink/75 hover:bg-ink/5"
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] ${isSelected ? "text-white/70" : "text-ink/40"}`}>
                  ({c.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Action bar (Filter & Sort Sheet Trigger + Quick On-Sale Toggle) */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Filter & Sort BottomSheet Trigger */}
            <button
              type="button"
              onClick={() => setBottomSheetOpen(true)}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all active-press shadow-xs ${
                hasActiveFilters
                  ? "border-brand-forest bg-mint-50 text-brand-forest font-black"
                  : "border-ink/15 bg-white text-ink hover:bg-ink/5"
              }`}
            >
              <SlidersHorizontal size={15} className={hasActiveFilters ? "text-brand-forest" : "text-ink/70"} />
              <span>Bộ lọc &amp; Sắp xếp</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-forest px-1 text-[10px] font-black text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Quick On-Sale Toggle Button */}
            <button
              type="button"
              onClick={toggleOnSale}
              className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition-all active-press ${
                onSale
                  ? "border-sale bg-rose-50 text-sale shadow-xs font-black"
                  : "border-ink/15 bg-white text-ink/70 hover:bg-ink/5"
              }`}
            >
              <span>⚡ Giảm giá</span>
            </button>
          </div>

          {/* Quick Sort Preview Indicator */}
          <button
            type="button"
            onClick={() => setBottomSheetOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-ink/60 hover:text-ink active-press"
          >
            <span>{currentSortObj.label}</span>
            <ChevronDown size={14} className="text-ink/40" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE NATIVE BOTTOMSHEET (Filter & Sort Selection)                      */}
      {/* ========================================================================= */}
      {bottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setBottomSheetOpen(false)}
            aria-hidden="true"
          />

          {/* BottomSheet Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Tùy chọn lọc và sắp xếp sản phẩm"
            className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-[32px] bg-[#FDFBF7] shadow-[0_-16px_50px_rgba(0,0,0,0.25)] border-t border-ink/10 animate-sheet-up overflow-hidden"
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-pointer flex-shrink-0"
              onClick={() => setBottomSheetOpen(false)}
            >
              <div className="h-1.5 w-12 rounded-full bg-ink/20 hover:bg-ink/40 transition-colors" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/5 px-6 pb-3 pt-1 flex-shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-brand-forest" />
                <h3 className="text-sm font-black uppercase tracking-wide text-ink">
                  Bộ Lọc &amp; Sắp Xếp
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-sale hover:bg-rose-50 active-press"
                  >
                    <RotateCcw size={12} />
                    <span>Đặt lại</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setBottomSheetOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/70 hover:bg-ink/10 active-press"
                  aria-label="Đóng bộ lọc"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto native-scroll px-6 py-4 space-y-6">
              {/* SECTION 1: SẮP XẾP THEO (Sort Selection Segments) */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-ink/50 block mb-2.5">
                  Sắp xếp theo
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = activeSort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSort(opt.value)}
                        className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all active-press border ${
                          isSelected
                            ? "bg-ink text-white border-ink shadow-sm"
                            : "bg-white border-ink/10 text-ink/75 hover:bg-ink/5"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check size={14} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: DANH MỤC SẢN PHẨM */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-ink/50">
                    Danh mục sản phẩm
                  </span>
                  {activeCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSingleCategory(null)}
                      className="text-[11px] font-bold text-brand-forest hover:underline"
                    >
                      Chọn tất cả
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleCategory(null)}
                    className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all active-press border ${
                      activeCategories.length === 0
                        ? "bg-brand-forest text-white border-brand-forest shadow-sm"
                        : "bg-white border-ink/10 text-ink/75 hover:bg-ink/5"
                    }`}
                  >
                    <span>Tất cả</span>
                    <span className="text-[10px] opacity-70">({totalCount})</span>
                  </button>

                  {categories.map((c) => {
                    const isChecked = activeCategories.includes(c.slug);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.slug)}
                        className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all active-press border ${
                          isChecked
                            ? "bg-brand-forest text-white border-brand-forest shadow-sm"
                            : "bg-white border-ink/10 text-ink/75 hover:bg-ink/5"
                        }`}
                      >
                        <span className="truncate mr-1">{c.name}</span>
                        <span className="text-[10px] opacity-70 flex-shrink-0">({c.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: KÍCH THƯỚC */}
              {sizes.length > 0 && (
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-ink/50 block mb-2.5">
                    Kích thước (Size)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const isSelected = activeSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all active-press ${
                            isSelected
                              ? "border-ink bg-ink text-white shadow-sm"
                              : "border-ink/15 bg-white text-ink/75 hover:border-ink/30"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 4: SẢN PHẨM ĐANG GIẢM GIÁ */}
              <div className="rounded-2xl border border-ink/10 bg-white p-4">
                <label className="flex cursor-pointer items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-sale">
                      ⚡
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">Chỉ hiện sản phẩm đang giảm giá</p>
                      <p className="text-[10px] text-ink/40">Lọc các ưu đãi và deal hot nhất</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={toggleOnSale}
                    className="h-5 w-5 rounded-md accent-brand-forest"
                  />
                </label>
              </div>
            </div>

            {/* Fixed Footer Action */}
            <div className="border-t border-ink/5 bg-[#FDFBF7] p-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => setBottomSheetOpen(false)}
                className="w-full rounded-2xl bg-ink py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-ink/90 active-press"
              >
                Áp Dụng Bộ Lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (hidden lg:block): Clean, elegant sticky desktop sidebar   */}
      {/* ========================================================================= */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/75 shadow-card hover:border-ink/25 transition-colors">
          <input
            type="checkbox"
            checked={onSale}
            onChange={toggleOnSale}
            className="h-4 w-4 rounded accent-brand-forest"
          />
          <span className="font-semibold text-xs text-ink">Chỉ hiện sản phẩm đang giảm giá</span>
        </label>

        <FilterSection
          title="Danh mục sản phẩm"
          open={categoriesOpen}
          onToggle={() => setCategoriesOpen((v) => !v)}
        >
          <FilterRow
            label="Tất cả sản phẩm"
            count={totalCount}
            checked={activeCategories.length === 0}
            onChange={() => setSingleCategory(null)}
          />
          {categories.map((c) => (
            <FilterRow
              key={c.id}
              label={c.name}
              count={c.count}
              checked={activeCategories.includes(c.slug)}
              onChange={() => toggleCategory(c.slug)}
            />
          ))}
        </FilterSection>

        {sizes.length > 0 && (
          <FilterSection title="Kích thước" open={sizesOpen} onToggle={() => setSizesOpen((v) => !v)}>
            <div className="flex flex-wrap gap-2 pt-1">
              {sizes.map((size) => {
                const active = activeSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active-press ${
                      active
                        ? "border-ink bg-ink text-white shadow-xs"
                        : "border-ink/15 bg-white text-ink/70 hover:border-ink/40"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-forest hover:underline pt-1"
          >
            <RotateCcw size={13} />
            <span>Xóa tất cả bộ lọc</span>
          </button>
        )}
      </aside>
    </>
  );
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-xs font-black uppercase tracking-wider text-ink"
      >
        {title}
        {open ? <ChevronUp size={16} className="text-ink/40" /> : <ChevronDown size={16} className="text-ink/40" />}
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function FilterRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-xs font-medium text-ink/75 hover:text-ink">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded accent-brand-forest"
        />
        {label}
      </span>
      <span className="text-[11px] text-ink/40">({count})</span>
    </label>
  );
}

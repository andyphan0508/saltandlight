"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "./Icons";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  count: number;
}

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

  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [sizesOpen, setSizesOpen] = useState(true);

  const activeCategories = parseList(searchParams.get("categories"));
  const activeSizes = parseList(searchParams.get("sizes"));
  const onSale = searchParams.get("onSale") === "1";

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

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  const hasActiveFilters = activeCategories.length > 0 || activeSizes.length > 0 || onSale;

  return (
    <aside className="w-full lg:w-64 lg:flex-shrink-0">
      <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/75 shadow-card">
        <input
          type="checkbox"
          checked={onSale}
          onChange={toggleOnSale}
          className="h-4 w-4 rounded accent-brand-forest"
        />
        Chỉ hiện sản phẩm đang giảm giá
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
          onChange={clearAll}
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
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-ink bg-ink text-white"
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
          onClick={clearAll}
          className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-forest hover:underline"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </aside>
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
    <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-sm font-bold uppercase tracking-wide text-ink"
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
    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm text-ink/75 hover:text-ink">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded accent-brand-forest"
        />
        {label}
      </span>
      <span className="text-xs text-ink/40">({count})</span>
    </label>
  );
}

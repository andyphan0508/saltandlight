"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Grid2, Grid3, Grid4, Rows } from "./Icons";

const VIEW_OPTIONS = [
  { value: "2", icon: Grid2, label: "2 cột" },
  { value: "3", icon: Grid3, label: "3 cột" },
  { value: "4", icon: Grid4, label: "4 cột" },
  { value: "list", icon: Rows, label: "Danh sách" },
] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp đến cao" },
  { value: "price-desc", label: "Giá: Cao đến thấp" },
  { value: "name-asc", label: "Tên: A-Z" },
] as const;

export function ProductToolbar({
  total,
  from,
  to,
}: {
  total: number;
  from: number;
  to: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get("view") ?? "3";
  const sort = searchParams.get("sort") ?? "latest";

  function setParam(key: string, value: string, defaultValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) params.delete(key);
    else params.set(key, value);
    if (key === "sort") params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-ink/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1 shadow-card">
          {VIEW_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = view === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-label={opt.label}
                aria-pressed={active}
                onClick={() => setParam("view", opt.value, "3")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-ink text-white" : "text-ink/40 hover:text-ink"
                }`}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>
        <span className="text-xs font-medium text-ink/55">
          {total === 0 ? "Không có sản phẩm" : `${from}–${to} trong ${total} sản phẩm`}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-ink/60">
        <label htmlFor="sort" className="hidden sm:inline">
          Sắp xếp
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setParam("sort", e.target.value, "latest")}
          className="rounded-full border border-ink/15 bg-white px-3.5 py-2 text-xs font-semibold text-ink focus:border-brand-forest focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function useProductView(): "2" | "3" | "4" | "list" {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "3";
  return (["2", "3", "4", "list"] as const).includes(view as never) ? (view as never) : "3";
}

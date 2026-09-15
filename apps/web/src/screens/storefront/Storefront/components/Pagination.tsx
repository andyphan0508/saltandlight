"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getPageList } from "@/helpers/page-list";
import { ChevronLeft, ChevronRight } from "@/components/Icons";

interface PaginationProps {
  total: number;
  pageSize: number;
}

export const Pagination = ({ total, pageSize }: PaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(totalPages, Math.max(1, Number(searchParams.get("page")) || 1));

  if (totalPages <= 1) return null;

  const onGoToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onGoToPage(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      {getPageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-sm text-ink/40">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onGoToPage(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              p === page ? "bg-ink text-white" : "text-ink/60 hover:bg-mint-100 hover:text-ink"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onGoToPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

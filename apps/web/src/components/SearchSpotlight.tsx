"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchModalStore } from "@/stores";
import { formatVND } from "@saltandlight/domain";
import { Search, X, ArrowRight } from "./Icons";
import type { ProductCardData } from "@/lib/types";

/**
 * Rendered as a sibling of <Header> in layout.tsx (not inside it) — same
 * containing-block reasoning as BottomTabBar/MobileDrawer: header's
 * `backdrop-blur-md` would otherwise collapse this overlay's `inset-0` down
 * to the header's own box instead of the full viewport.
 */
export const SearchSpotlight = () => {
  const open = useSearchModalStore((s) => s.open);
  const setOpen = useSearchModalStore((s) => s.setOpen);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Reset + autofocus each time it opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTotal(0);
      setActiveIndex(-1);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounced live search.
  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products ?? []);
        setTotal(data.total ?? 0);
        setActiveIndex(-1);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  const onClose = () => {
    setOpen(false);
  };

  const onGoToFullResults = () => {
    if (!query.trim()) return;
    router.push(`/san-pham?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        router.push(`/san-pham/${results[activeIndex]!.slug}`);
        onClose();
      } else {
        onGoToFullResults();
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onWindowKeyDown);
    return () => document.removeEventListener("keydown", onWindowKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-center px-4 pt-[12vh] sm:pt-[16vh]">
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      <div className="relative flex h-fit max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-150">
        <div className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
          <Search size={20} className="flex-shrink-0 text-ink/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Tìm áo thun, túi tote, câu Kinh Thánh..."
            className="w-full bg-transparent text-base text-ink placeholder-ink/35 focus:outline-none"
          />
          {isLoading && (
            <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-ink/20 border-t-ink/60" />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng tìm kiếm"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {query.trim() && (
          <div className="overflow-y-auto">
            {results.length > 0 ? (
              <>
                <ul className="py-2">
                  {results.map((p, i) => (
                    <li key={p.id}>
                      <Link
                        href={`/san-pham/${p.slug}`}
                        onClick={onClose}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`flex items-center gap-3 px-5 py-2.5 transition-colors ${
                          activeIndex === i ? "bg-mint-50" : "hover:bg-mint-50/60"
                        }`}
                      >
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-mint-100">
                          {p.imageUrl && (
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-ink">{p.name}</div>
                          <div className="text-xs text-ink/50">{formatVND(p.minPrice)}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {total > results.length && (
                  <button
                    type="button"
                    onClick={onGoToFullResults}
                    className="flex w-full items-center justify-between border-t border-ink/10 px-5 py-3 text-xs font-bold uppercase tracking-wide text-brand-forest hover:bg-mint-50"
                  >
                    <span>Xem tất cả {total} kết quả</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </>
            ) : !isLoading ? (
              <p className="px-5 py-8 text-center text-sm text-ink/45">
                Không tìm thấy sản phẩm nào cho &ldquo;{query}&rdquo;
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

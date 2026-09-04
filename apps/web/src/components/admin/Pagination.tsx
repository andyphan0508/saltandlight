import Link from "next/link";
import { ChevronLeft, ChevronRight } from "./Icons";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

function hrefFor(basePath: string, page: number, searchParams?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams ?? {})) {
    if (v) params.set(k, v);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageList(current: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, totalPages - 1, totalPages, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function Pagination({ page, pageSize, total, basePath, searchParams }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-ink/10 px-5 py-4 sm:flex-row">
      <p className="text-xs text-ink/50">
        Hiển thị <span className="font-semibold text-ink">{from}–{to}</span> trong tổng{" "}
        <span className="font-semibold text-ink">{total}</span>
      </p>
      {totalPages > 1 && (
        <nav className="flex items-center gap-1">
          <PageLink
            href={hrefFor(basePath, Math.max(1, page - 1), searchParams)}
            disabled={page <= 1}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </PageLink>
          {pageList(page, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-xs text-ink/40">
                …
              </span>
            ) : (
              <PageLink key={p} href={hrefFor(basePath, p, searchParams)} active={p === page}>
                {p}
              </PageLink>
            ),
          )}
          <PageLink
            href={hrefFor(basePath, Math.min(totalPages, page + 1), searchParams)}
            disabled={page >= totalPages}
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </PageLink>
        </nav>
      )}
    </div>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/20">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors ${
        active ? "bg-ink text-white" : "text-ink/60 hover:bg-mint-100 hover:text-ink"
      }`}
      {...rest}
    >
      {children}
    </Link>
  );
}

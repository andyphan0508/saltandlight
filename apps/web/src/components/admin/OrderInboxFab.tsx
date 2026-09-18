"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { formatVND } from "@saltandlight/domain";
import { adminFetch } from "@/api/admin-fetch";
import { ADMIN_ORDER_STATUS } from "@/helpers/order-status-styles";
import { ShoppingBag, X } from "./Icons";

interface InboxOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customerName: string;
  itemCount: number;
}

interface Inbox {
  count: number;
  orders: InboxOrder[];
}

// ponytail: 60s polling, not push — a new order shows up within a minute. Switch
// to Supabase Realtime on `orders` inserts if that delay ever matters.
const POLL_MS = 60_000;
const SEEN_KEY = "admin-order-inbox-seen-at";

const readSeenAt = () => {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeSeenAt = (value: number) => {
  try {
    localStorage.setItem(SEEN_KEY, String(value));
  } catch {
    // Private mode / blocked storage: the glow just shows again next load
  }
};

const timeAgo = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
};

/**
 * Floating order inbox for the admin: the badge counts orders still waiting on
 * the shop, and the button glows while any of them arrived after the admin last
 * opened the menu. Opening the menu marks them seen.
 */
export const OrderInboxFab = () => {
  const pathname = usePathname();
  const [inbox, setInbox] = useState<Inbox>({ count: 0, orders: [] });
  // seenAt drives the glow; menuSeenAt is its value from just before the menu
  // opened, so the "Mới" markers stay visible while the admin is reading them.
  const [seenAt, setSeenAt] = useState(0);
  const [menuSeenAt, setMenuSeenAt] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const knownIds = useRef<Set<string> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const next = await adminFetch<Inbox>("/api/admin/orders/inbox");
      // Announce orders that arrived while the page was open — not the backlog on first load
      if (knownIds.current) {
        const fresh = next.orders.filter((o) => !knownIds.current!.has(o.id));
        if (fresh.length) {
          toast.success(fresh.length === 1 ? `Đơn mới ${fresh[0]!.orderNumber}` : `${fresh.length} đơn hàng mới`, {
            description: fresh.length === 1 ? `${fresh[0]!.customerName} · ${formatVND(fresh[0]!.total)}` : undefined,
          });
        }
      }
      knownIds.current = new Set(next.orders.map((o) => o.id));
      setInbox(next);
    } catch {
      // A missed poll is harmless; the next one retries
    }
  }, []);

  useEffect(() => {
    setSeenAt(readSeenAt());
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    // Coming back to the tab refreshes immediately instead of waiting out the interval
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  // Close on navigation (e.g. after picking an order), Escape, or a click outside
  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [isOpen]);

  const newest = inbox.orders[0] ? new Date(inbox.orders[0].createdAt).getTime() : 0;
  const unseenCount = inbox.orders.filter((o) => new Date(o.createdAt).getTime() > seenAt).length;
  const hasUnseen = unseenCount > 0;

  const onToggle = () => {
    if (isOpen) return setIsOpen(false);
    setMenuSeenAt(seenAt);
    if (newest > seenAt) {
      writeSeenAt(newest);
      setSeenAt(newest);
    }
    setIsOpen(true);
  };

  return (
    <div ref={panelRef} className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-50 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Đơn hàng cần xử lý"
          className="w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-pop-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <div className="text-sm font-bold text-ink">Đơn hàng cần xử lý</div>
              <div className="text-[11px] text-slate-500">
                {inbox.count === 0 ? "Không có đơn nào đang chờ" : `${inbox.count} đơn đang chờ bạn`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng"
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>

          <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
            {inbox.orders.map((order) => {
              const isUnseen = new Date(order.createdAt).getTime() > menuSeenAt;
              const meta = ADMIN_ORDER_STATUS[order.status];
              return (
                <li key={order.id}>
                  <Link href={`/admin/orders/${order.id}`} className="flex gap-3 px-4 py-3 hover:bg-slate-50">
                    <span
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${isUnseen ? "bg-emerald-500" : "bg-transparent"}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-bold text-ink">{order.orderNumber}</span>
                        <span className="text-xs font-bold text-brand-forest">{formatVND(order.total)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-600">
                        {order.customerName} · {order.itemCount} sản phẩm
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        {meta && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.className}`}>{meta.label}</span>
                        )}
                        <span className="text-[10px] text-slate-400">{timeAgo(order.createdAt)}</span>
                        {isUnseen && <span className="text-[10px] font-bold text-emerald-600">Mới</span>}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/admin/orders"
            className="block border-t border-slate-100 px-4 py-2.5 text-center text-xs font-bold text-brand-forest hover:bg-slate-50"
          >
            Xem tất cả đơn hàng
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={
          inbox.count ? `${inbox.count} đơn hàng cần xử lý${hasUnseen ? `, ${unseenCount} đơn mới` : ""}` : "Đơn hàng"
        }
        className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all active:scale-95 ${
          hasUnseen ? "bg-emerald-600 ring-4 ring-emerald-400/40" : "bg-ink hover:bg-ink/90"
        }`}
      >
        {hasUnseen && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400 opacity-40 animate-ping motion-reduce:animate-none"
          />
        )}
        <ShoppingBag size={22} className="relative" />
        {inbox.count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-sale px-1.5 text-[11px] font-bold">
            {inbox.count > 99 ? "99+" : inbox.count}
          </span>
        )}
      </button>
    </div>
  );
};


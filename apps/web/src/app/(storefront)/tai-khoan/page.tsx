"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { formatVND, ORDER_STATUS_LABELS, type OrderStatusValue } from "@saltandlight/domain";
import { useCustomer } from "@/lib/use-customer";
import {
  User,
  LogOut,
  ShoppingBag,
  Truck,
  Check,
  Clock,
  ChevronDown,
  Copy,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "@/components/Icons";

interface OrderItem {
  productNameSnapshot: string;
  color: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
}

interface StatusHistoryItem {
  toStatus: string;
  changedAt: string;
  note: string | null;
}

interface CustomerOrder {
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  createdAt: string;
  items: OrderItem[];
  statusHistory: StatusHistoryItem[];
}

const STATUS_BADGE_STYLES: Record<OrderStatusValue, string> = {
  pending_payment: "bg-amber-50 text-amber-800 border-amber-200/80",
  processing: "bg-blue-50 text-blue-800 border-blue-200/80",
  on_hold: "bg-orange-50 text-orange-800 border-orange-200/80",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200/80",
  refunded: "bg-zinc-100 text-zinc-700 border-zinc-200/80",
};

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading: authLoading, signOut } = useCustomer();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [copiedOrder, setCopiedOrder] = useState<string | null>(null);

  // Auth guard: redirect to /dang-nhap if unauthenticated
  useEffect(() => {
    if (!authLoading && !customer) {
      router.replace("/dang-nhap?next=/tai-khoan");
    }
  }, [authLoading, customer, router]);

  // Fetch orders when authenticated
  useEffect(() => {
    if (!customer) return;

    let mounted = true;
    setOrdersLoading(true);

    fetch("/api/customer/orders", {
      headers: { "Cache-Control": "no-cache" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Orders request failed");
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setOrders(Array.isArray(data?.orders) ? data.orders : []);
          setOrdersLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Fetch customer orders error:", err);
        if (mounted) setOrdersLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [customer]);

  const toggleExpand = (orderNumber: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderNumber]: !prev[orderNumber],
    }));
  };

  const handleCopy = (orderNumber: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderNumber);
      setCopiedOrder(orderNumber);
      setTimeout(() => setCopiedOrder(null), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || (!customer && ordersLoading)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 space-y-8 animate-pulse">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-mint-100" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 rounded-xl bg-ink/10" />
            <div className="h-4 w-32 rounded-xl bg-ink/5" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-44 rounded-2xl bg-ink/10" />
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white shadow-card border border-ink/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8 animate-slide-up-fade">
      {/* Customer Profile Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-mint-50 via-white to-cream-50 p-6 sm:p-8 shadow-card border border-mint-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar Circle */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-brand-forest text-white text-xl font-black shadow-md ring-4 ring-mint-200/70">
            {customer.fullName.trim().charAt(0).toUpperCase() || "S"}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-forest">
                Khách hàng thân thiết
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-black uppercase text-ink truncate">
              {customer.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/65">
              {customer.email && <span>{customer.email}</span>}
              {customer.email && customer.phone && <span>•</span>}
              {customer.phone ? (
                <span>{customer.phone}</span>
              ) : (
                <span className="italic text-ink/40 text-[11px]">
                  (Số điện thoại sẽ tự động lưu khi bạn đặt hàng)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/san-pham">
            <Button variant="secondary" size="sm" className="whitespace-nowrap">
              <ShoppingBag size={15} />
              <span>Mua sắm</span>
            </Button>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-bold text-ink/75 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors active-press"
          >
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Orders Section Header */}
      <div className="border-b border-ink/10 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Truck size={20} className="text-brand-forest" />
          <h2 className="font-display text-lg sm:text-xl font-black uppercase text-ink">
            Đơn Hàng Của Bạn ({orders.length})
          </h2>
        </div>
        <Link
          href="/tra-cuu-don-hang"
          className="text-xs font-bold text-brand-forest hover:underline"
        >
          Tra cứu bưu tá khác →
        </Link>
      </div>

      {/* Orders List */}
      {ordersLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white p-6 shadow-card border border-ink/5" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl bg-white p-12 text-center shadow-card border border-ink/5 space-y-4 animate-fade-in">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint-100 text-brand-forest">
            <ShoppingBag size={36} />
          </div>
          <h3 className="font-display text-lg font-black uppercase text-ink">
            Bạn chưa có đơn hàng nào
          </h3>
          <p className="text-xs sm:text-sm text-ink/60 max-w-md mx-auto">
            Khám phá các mẫu áo thun Lời Chúa và quà tặng Cơ Đốc ý nghĩa tại Salt &amp; Light. Đơn hàng của bạn sẽ được lưu tự động tại đây.
          </p>
          <div className="pt-2">
            <Link href="/san-pham">
              <Button variant="primary" size="lg" className="shadow-md">
                <span>Khám phá bộ sưu tập ngay</span>
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Orders Items List */
        <div className="space-y-5">
          {orders.map((order) => {
            const isExpanded = !!expandedOrders[order.orderNumber];
            const statusLabel =
              ORDER_STATUS_LABELS[order.status] ?? "Đang xử lý";
            const badgeStyle =
              STATUS_BADGE_STYLES[order.status] ??
              "bg-zinc-100 text-zinc-800 border-zinc-200";

            const formattedDate = new Date(order.createdAt).toLocaleString(
              "vi-VN",
              {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            );

            return (
              <div
                key={order.orderNumber}
                className="rounded-3xl bg-white p-5 sm:p-6 shadow-card border border-ink/5 space-y-4 transition-all hover:border-ink/15"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/5 pb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm sm:text-base text-ink">
                        #{order.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.orderNumber)}
                        className="rounded-lg p-1 text-ink/40 hover:bg-ink/5 hover:text-ink transition-colors"
                        title="Sao chép mã đơn"
                      >
                        <Copy size={13} />
                      </button>
                      {copiedOrder === order.orderNumber && (
                        <span className="text-[10px] font-bold text-emerald-600 animate-pop-in">
                          Đã chép!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink/50">
                      <Clock size={12} />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badgeStyle}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{statusLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-cream-50/70 p-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink truncate">
                          {item.productNameSnapshot}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink/50">
                          {item.color && <span>Màu: <strong className="text-ink/80">{item.color}</strong></span>}
                          {item.color && item.size && <span>•</span>}
                          {item.size && <span>Size: <strong className="text-ink/80">{item.size}</strong></span>}
                          <span>•</span>
                          <span>SL: <strong className="text-ink/80">x{item.quantity}</strong></span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 font-bold text-ink">
                        {formatVND(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Total */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 pt-4">
                  <div>
                    <span className="text-xs text-ink/60">Tổng thanh toán: </span>
                    <span className="font-display font-black text-base text-ink sm:text-lg">
                      {formatVND(order.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Timeline History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.orderNumber)}
                        className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-forest hover:bg-mint-50 transition-colors"
                      >
                        <span>Lịch sử xử lý</span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}

                    {/* View Details Link */}
                    <Link
                      href={`/don-hang/${order.orderNumber}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-ink px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-ink-800 transition-colors active-press"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Expandable Status History Timeline */}
                {isExpanded && order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="rounded-2xl border border-ink/10 bg-mint-50/50 p-4 space-y-3 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink/70">
                      Hành Trình Đơn Hàng
                    </h4>
                    <div className="relative border-l-2 border-brand-forest/20 ml-2.5 pl-4 space-y-3">
                      {order.statusHistory.map((step, stepIdx) => {
                        const stepDate = new Date(step.changedAt).toLocaleString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          }
                        );
                        const stepStatusLabel =
                          ORDER_STATUS_LABELS[step.toStatus as OrderStatusValue] ??
                          step.toStatus;

                        return (
                          <div key={stepIdx} className="relative">
                            {/* Bullet */}
                            <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-forest shadow-xs" />
                            <div className="text-xs">
                              <span className="font-bold text-ink">
                                {stepStatusLabel}
                              </span>
                              <span className="ml-2 text-[11px] text-ink/45">
                                {stepDate}
                              </span>
                              {step.note && (
                                <p className="mt-0.5 text-xs text-ink/65 italic">
                                  {step.note}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

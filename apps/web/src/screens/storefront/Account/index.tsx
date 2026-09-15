"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck } from "@/components/Icons";
import { useCustomer } from "@/hooks/use-customer";
import { useCustomerOrders } from "@/hooks/use-customer-orders";
import { AccountProfileCard } from "./components/AccountProfileCard";
import { AccountSkeleton, OrderCardsSkeleton } from "./components/AccountSkeleton";
import { EmptyOrders } from "./components/EmptyOrders";
import { OrderCard } from "./components/OrderCard";

const AccountPage = () => {
  const router = useRouter();
  const { customer, isLoading: isAuthLoading, onSignOut } = useCustomer();
  const { orders, isLoading: isOrdersLoading } = useCustomerOrders(Boolean(customer));

  // Signed-out visitors go to the login page and come back here afterwards
  useEffect(() => {
    if (!isAuthLoading && !customer) router.replace("/dang-nhap?next=/tai-khoan");
  }, [isAuthLoading, customer, router]);

  const onLogout = async () => {
    await onSignOut();
    router.push("/");
  };

  if (isAuthLoading || (!customer && isOrdersLoading)) return <AccountSkeleton />;
  if (!customer) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8 animate-slide-up-fade">
      <AccountProfileCard customer={customer} onLogout={onLogout} />

      <div className="border-b border-ink/10 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Truck size={20} className="text-brand-forest" />
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase text-ink">Đơn Hàng Của Bạn ({orders.length})</h2>
        </div>
        <Link href="/tra-cuu-don-hang" className="text-xs font-bold text-brand-forest hover:underline">
          Tra cứu bưu tá khác →
        </Link>
      </div>

      {isOrdersLoading ? (
        <OrderCardsSkeleton />
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountPage;

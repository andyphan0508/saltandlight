import { useEffect, useState } from "react";
import type { CustomerOrder } from "@/interfaces/customer-order";

/** The signed-in customer's orders; fetched once the customer is known. */
export const useCustomerOrders = (isSignedIn: boolean) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;
    let isCurrent = true;
    setIsLoading(true);

    fetch("/api/customer/orders", { headers: { "Cache-Control": "no-cache" } })
      .then((res) => {
        if (!res.ok) throw new Error("Orders request failed");
        return res.json();
      })
      .then((data) => {
        if (isCurrent) setOrders(Array.isArray(data?.orders) ? data.orders : []);
      })
      .catch((err) => console.warn("Fetch customer orders error:", err))
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isSignedIn]);

  return { orders, isLoading };
};

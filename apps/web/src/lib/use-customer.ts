"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface CustomerData {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
}

export function useCustomer() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/me", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer ?? null);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomer();

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          fetchCustomer();
        } else if (event === "SIGNED_OUT") {
          setCustomer(null);
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // safe fallback
    }
  }, [fetchCustomer]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("SignOut error:", err);
    } finally {
      setCustomer(null);
    }
  }, []);

  return { customer, loading, signOut, mutate: fetchCustomer };
}

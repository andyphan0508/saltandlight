"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createSupabaseBrowserClient } from "@/api/supabase-client";

export interface CustomerData {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
}

const useCustomerStore = create<{ customer: CustomerData | null; isLoading: boolean }>(() => ({
  customer: null,
  isLoading: true,
}));

const onRefreshCustomer = async () => {
  try {
    const res = await fetch("/api/customer/me", { headers: { "Cache-Control": "no-cache" } });
    const data = res.ok ? await res.json() : null;
    useCustomerStore.setState({ customer: data?.customer ?? null, isLoading: false });
  } catch {
    useCustomerStore.setState({ customer: null, isLoading: false });
  }
};

let hasStarted = false;

/** Header, drawer and account pages all call useCustomer(); only the first call fetches and subscribes. */
const onStart = () => {
  if (hasStarted) return;
  hasStarted = true;
  void onRefreshCustomer();
  try {
    createSupabaseBrowserClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") void onRefreshCustomer();
      else if (event === "SIGNED_OUT") useCustomerStore.setState({ customer: null, isLoading: false });
    });
  } catch {
    // Supabase not configured in this environment
  }
};

const onSignOut = async () => {
  try {
    await createSupabaseBrowserClient().auth.signOut();
  } catch (err) {
    console.warn("SignOut error:", err);
  } finally {
    useCustomerStore.setState({ customer: null });
  }
};

export const useCustomer = () => {
  useEffect(onStart, []);
  const customer = useCustomerStore((s) => s.customer);
  const isLoading = useCustomerStore((s) => s.isLoading);
  return { customer, isLoading, onSignOut };
};

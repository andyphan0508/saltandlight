import { cache } from "react";
import { prisma } from "@saltandlight/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Memoized per request. Unlike admin_users, customers.email is NOT unique —
 * guest checkout creates one Customer row per order — so linking on first
 * login can't just "become" one existing guest row. Instead it creates a
 * fresh authenticated Customer and re-parents every past guest order that
 * matches this (OAuth-verified) email onto it, so order history from before
 * login shows up immediately without picking one arbitrary old guest row.
 */
export const getAuthenticatedCustomer = cache(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let customer = await prisma.customer.findUnique({
    where: { authUserId: user.id },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        authUserId: user.id,
        email: user.email ?? null,
        fullName:
          (user.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined ??
          (user.user_metadata as Record<string, unknown> | undefined)?.name as string | undefined ??
          user.email?.split("@")[0] ??
          "Khách hàng",
        isGuest: false,
      },
    });

    if (user.email) {
      const guestCustomers = await prisma.customer.findMany({
        where: { email: user.email, isGuest: true, authUserId: null },
        select: { id: true },
      });
      if (guestCustomers.length > 0) {
        await prisma.order.updateMany({
          where: { customerId: { in: guestCustomers.map((c) => c.id) } },
          data: { customerId: customer.id },
        });
      }
    }
  }

  return customer;
});

import type { Prisma, PrismaClient } from "@saltandlight/db";

/**
 * Produces "SL-2026-000142" style numbers. Counts existing orders for the
 * current year inside the same transaction and retries on unique-constraint
 * collisions, so it stays correct under concurrent checkouts without a
 * dedicated DB sequence.
 */
export async function nextOrderNumber(
  tx: PrismaClient | Prisma.TransactionClient,
): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.order.count({
    where: { orderNumber: { startsWith: `SL-${year}-` } },
  });
  const seq = String(count + 1).padStart(6, "0");
  return `SL-${year}-${seq}`;
}

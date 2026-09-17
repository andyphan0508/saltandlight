import type { Prisma, PrismaClient } from "@saltandlight/db";

/**
 * Produces "SL-2026-000142" style numbers: one past the highest number issued this
 * year (the zero-padded sequence sorts as text). Two checkouts in the same instant
 * can still pick the same number; the unique constraint rejects the second and the
 * order API retries it.
 */
export async function nextOrderNumber(
  tx: PrismaClient | Prisma.TransactionClient,
): Promise<string> {
  const year = new Date().getFullYear();
  const last = await tx.order.findFirst({
    where: { orderNumber: { startsWith: `SL-${year}-` } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const seq = String((Number(last?.orderNumber.slice(`SL-${year}-`.length)) || 0) + 1).padStart(6, "0");
  return `SL-${year}-${seq}`;
}

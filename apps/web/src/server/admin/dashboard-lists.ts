import { prisma } from "@saltandlight/db";

/** Latest orders for the dashboard table. */
export const getRecentOrders = (take = 6) =>
  prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
      customer: { select: { fullName: true, phone: true } },
    },
  });

/** Active variants with five or fewer items left, lowest stock first. */
export const getLowStockVariants = (take = 5) =>
  prisma.productVariant.findMany({
    where: { isActive: true, stockQuantity: { lte: 5 } },
    orderBy: { stockQuantity: "asc" },
    take,
    select: {
      id: true,
      productId: true,
      size: true,
      color: true,
      stockQuantity: true,
      product: { select: { name: true } },
    },
  });

export type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];
export type LowStockVariant = Awaited<ReturnType<typeof getLowStockVariants>>[number];

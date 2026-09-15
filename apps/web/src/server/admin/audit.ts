import { prisma, Prisma } from "@saltandlight/db";

export const logAudit = async (opts: {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) => {
  await prisma.auditLog.create({
    data: {
      adminUserId: opts.adminUserId,
      action: opts.action,
      entityType: opts.entityType,
      entityId: opts.entityId,
      metadata: opts.metadata as Prisma.InputJsonValue | undefined,
    },
  });
};

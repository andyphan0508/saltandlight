import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

// Reuse a single client across hot-reloads and warm serverless containers
// to eliminate connection handshake overhead and conserve Supabase connections.
export const prisma = globalThis.__prisma__ ?? new PrismaClient();

globalThis.__prisma__ = prisma;

export * from "@prisma/client";

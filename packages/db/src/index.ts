import { PrismaClient } from "@prisma/client";
import { PrismaClient as EdgePrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

/**
 * Cloudflare Workers can't run Prisma's normal client: the query engine
 * (native binary, driver-adapter, or WASM query-compiler modes alike) calls
 * `fs.readdir`/`fs.readFileSync` internally, which Workers doesn't
 * implement — confirmed by direct testing, not a config mistake. Raw
 * TCP drivers (`pg`, `postgres.js`) hit their own separately-confirmed,
 * currently-open Workers/Hyperdrive compatibility bugs (hangs that don't
 * reproduce locally). Prisma Accelerate sidesteps all of this: it proxies
 * queries over plain HTTPS, which is exactly what Workers' fetch-based
 * runtime is built for — no TCP socket, no native engine binary.
 */
/**
 * The current Worker request's ExecutionContext, or null outside a Worker request
 * (local `next dev`, `next build`, scripts, the Prisma CLI), where it throws.
 */
function workerRequest(): object | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@opennextjs/cloudflare").getCloudflareContext().ctx ?? null;
  } catch {
    return null;
  }
}

/**
 * One client per Worker request, never shared: with one client for the whole isolate,
 * concurrent requests (a page plus Next's link prefetches, a checkout during browsing)
 * had promises resolved in another request's I/O context (prisma/prisma#28732), and the
 * runtime killed the loser as "hung" — a crash no retry can catch. Accelerate talks
 * HTTPS, so a client is only an object: nothing to connect or pool.
 */
const requestClients = new WeakMap<object, PrismaClient>();

function getOrCreatePrisma(): PrismaClient {
  const request = workerRequest();
  if (request) {
    let client = requestClients.get(request);
    if (!client) {
      client = new EdgePrismaClient({ datasourceUrl: process.env.ACCELERATE_URL }).$extends(
        withAccelerate(),
      ) as unknown as PrismaClient;
      requestClients.set(request, client);
    }
    return client;
  }
  if (!globalThis.__prisma__) globalThis.__prisma__ = new PrismaClient();
  return globalThis.__prisma__;
}

/** Drops the current client so the next query builds a fresh one. */
function resetPrisma() {
  const request = workerRequest();
  if (request) requestClients.delete(request);
  else globalThis.__prisma__ = undefined;
}

const TRANSIENT_ERROR_REGEX =
  /connection closed|closed the connection|connection terminated|can't reach database|terminating connection|broken pipe|econnreset|etimedout|57P01|P1001|P1002|P1017/i;

// Kept as a last resort: per-request clients (above) are the fix for the
// cross-request "Worker's code had hung" cancellation, prisma/prisma#28732.
const HUNG_REQUEST_REGEX = /runtime canceled this request|detected that your worker's code had hung/i;

export function isTransientConnectionError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return TRANSIENT_ERROR_REGEX.test(msg) || HUNG_REQUEST_REGEX.test(msg);
}

async function runWithRetry<T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> {
  let attempt = 0;
  const maxRetries = 2;
  while (true) {
    const client = getOrCreatePrisma();
    try {
      return await operation(client);
    } catch (err) {
      attempt++;
      if (attempt <= maxRetries && isTransientConnectionError(err)) {
        console.warn(
          `[db] Transient connection error: "${(err as Error).message}". Resetting connection pool and retrying (${attempt}/${maxRetries})...`,
        );
        try {
          await client.$disconnect();
        } catch {
          // ignore disconnect error on closed socket
        }
        resetPrisma();
        await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
        continue;
      }
      throw err;
    }
  }
}

/**
 * A plain `export const prisma = createClient()` would run at module-load
 * time, which in a Worker can happen before OpenNext has set up the
 * current request's context — `isCloudflareWorker()` would then wrongly
 * report "not a Worker" and bake in a plain `PrismaClient()` (which then
 * crashes on its first real query) for the rest of that isolate's life.
 * `prisma` is a Proxy so the real client is only built the first time a
 * query actually runs — always inside a request — and reused for the rest
 * of that request (outside Workers: for the life of the process).
 *
 * It also wraps model operations and query methods with automatic retry
 * on transient pooler/PgBouncer disconnects ("Connection closed"), discarding
 * the dead connection and reconnecting seamlessly.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getOrCreatePrisma();
    const value = Reflect.get(client as object, prop);

    // If accessing top-level methods like $transaction, $queryRaw, $executeRaw
    if (typeof value === "function") {
      if (prop === "$connect" || prop === "$disconnect") {
        return value.bind(client);
      }
      return (...args: any[]) =>
        runWithRetry((c) => {
          const method = Reflect.get(c as object, prop);
          return method.apply(c, args);
        });
    }

    // If accessing a model delegate (e.g. prisma.product, prisma.category, prisma.order)
    if (value && typeof value === "object" && typeof prop === "string" && !prop.startsWith("_")) {
      return new Proxy(value, {
        get(modelTarget, modelProp) {
          const origMethod = Reflect.get(modelTarget, modelProp);
          if (typeof origMethod === "function") {
            return (...args: any[]) =>
              runWithRetry((c) => {
                const delegate = Reflect.get(c as object, prop);
                const method = Reflect.get(delegate as object, modelProp);
                return method.apply(delegate, args);
              });
          }
          return origMethod;
        },
      });
    }

    return value;
  },
});

export * from "@prisma/client";


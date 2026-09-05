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
function isCloudflareWorker(): boolean {
  try {
    // Only resolves inside a Cloudflare Worker request — throws everywhere
    // else (local `next dev`, `next build`, scripts, the Prisma CLI).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("@opennextjs/cloudflare").getCloudflareContext();
    return true;
  } catch {
    return false;
  }
}

function createClient(): PrismaClient {
  if (isCloudflareWorker()) {
    return new EdgePrismaClient({ datasourceUrl: process.env.ACCELERATE_URL }).$extends(
      withAccelerate(),
    ) as unknown as PrismaClient;
  }
  return new PrismaClient();
}

function getOrCreatePrisma(): PrismaClient {
  if (!globalThis.__prisma__) globalThis.__prisma__ = createClient();
  return globalThis.__prisma__;
}

/**
 * A plain `export const prisma = createClient()` would run at module-load
 * time, which in a Worker can happen before OpenNext has set up the
 * current request's context — `isCloudflareWorker()` would then wrongly
 * report "not a Worker" and bake in a plain `PrismaClient()` (which then
 * crashes on its first real query) for the rest of that isolate's life.
 * `prisma` is a Proxy so the real client is only built the first time a
 * query actually runs — always inside a request — then cached on
 * `globalThis` for reuse across requests on that warm isolate.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getOrCreatePrisma();
    const value = Reflect.get(client as object, prop);
    // Prisma Client methods close over private state tied to the exact
    // object they were declared on — call one with `this` bound to this
    // Proxy (the default for `prisma.foo()`) and it breaks. Binding to the
    // real client keeps `this` correct.
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export * from "@prisma/client";

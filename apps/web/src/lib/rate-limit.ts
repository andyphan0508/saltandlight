import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface LimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Milliseconds until the caller may retry. */
  resetMs: number;
}

interface Limiter {
  limit(key: string): Promise<LimitResult>;
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Fixed-window counter, scoped to a single serverless/edge instance's memory.
 * Used when Upstash isn't configured, so every deployment gets baseline
 * throttling with zero setup. Weaker than the Redis-backed limiter under
 * multiple concurrent instances (each instance counts independently), but
 * still meaningfully slows a single client hammering one warm instance —
 * and Vercel tends to reuse the same instance for a burst of requests from
 * the same IP in a short window, which is exactly the case this catches.
 */
class MemoryLimiter implements Limiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private max: number,
    private windowMs: number,
  ) {}

  async limit(key: string): Promise<LimitResult> {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      this.gc(now);
      return { success: true, limit: this.max, remaining: this.max - 1, resetMs: this.windowMs };
    }

    entry.count += 1;
    const success = entry.count <= this.max;
    return {
      success,
      limit: this.max,
      remaining: Math.max(0, this.max - entry.count),
      resetMs: entry.resetAt - now,
    };
  }

  /** Bound memory use — sweep expired entries once the map gets large. */
  private gc(now: number) {
    if (this.hits.size < 5000) return;
    for (const [k, v] of this.hits) {
      if (v.resetAt <= now) this.hits.delete(k);
    }
  }
}

class UpstashLimiter implements Limiter {
  private rl: Ratelimit;

  constructor(prefix: string, max: number, windowSeconds: number) {
    this.rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      prefix: `ratelimit:${prefix}`,
      analytics: false,
    });
  }

  async limit(key: string): Promise<LimitResult> {
    const r = await this.rl.limit(key);
    return {
      success: r.success,
      limit: r.limit,
      remaining: r.remaining,
      resetMs: Math.max(0, r.reset - Date.now()),
    };
  }
}

const limiters = new Map<string, Limiter>();

/**
 * Gets (or lazily creates) a named rate limiter. Backed by Upstash Redis when
 * UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are set (accurate across all
 * serverless/edge instances); otherwise falls back to the in-memory limiter
 * above so protection works out of the box on a fresh deploy.
 */
export function getRateLimiter(name: string, max: number, windowSeconds: number): Limiter {
  const cacheKey = `${name}:${max}:${windowSeconds}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = redis ? new UpstashLimiter(name, max, windowSeconds) : new MemoryLimiter(max, windowSeconds * 1000);
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/** Best-effort client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return (xff.split(",")[0] || xff).trim();
  return req.headers.get("x-real-ip") || "unknown";
}

import { Context, Next } from "hono";
import type { Env } from "../types.js";
import { safeWaitUntil } from "../utils/waitUntil.js";

/**
 * Rate limiting via KV counter.
 * NOTE: KV has eventual consistency and no atomic increment.
 * Under concurrent requests, the counter may under-count (last-write-wins).
 * This is an approximate rate limit by design — acceptable for free tier.
 * For strict enforcement, migrate to D1 with UPDATE ... SET count = count + 1.
 */
const TIER_LIMITS: Record<string, number> = {
  free: 100,
  pro: 10000,
  enterprise: 100000,
  payg: 1000000, // effectively unlimited
};

interface RateLimitContext {
  Bindings: Env;
  Variables: {
    apiKeyTier: string;
    apiKeyHash: string;
  };
}

function getTodayKey(hash: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `ratelimit:${hash}:${today}`;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Record daily usage to D1 for PAYG billing.
 * Fire-and-forget — failures here don't affect the request.
 */
async function recordUsageToD1(db: D1Database, keyHash: string): Promise<void> {
  const date = getToday();
  await db
    .prepare(
      `INSERT INTO usage_records (key_hash, date, request_count)
       VALUES (?, ?, 1)
       ON CONFLICT(key_hash, date)
       DO UPDATE SET request_count = request_count + 1`
    )
    .bind(keyHash, date)
    .run();
}

export async function rateLimitMiddleware(
  c: Context<RateLimitContext>,
  next: Next
) {
  const tier = c.get("apiKeyTier") ?? "free";
  const keyHash = c.get("apiKeyHash");
  const kv = c.env.KV;

  const kvKey = getTodayKey(keyHash);
  const currentStr = await kv.get(kvKey);
  const current = currentStr ? parseInt(currentStr, 10) : 0;

  const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;

  // PAYG tier: count but don't enforce daily cap
  if (tier !== "payg" && current >= limit) {
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", "0");
    c.header("Retry-After", "86400");

    return c.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `${tier} tier limit of ${limit} requests/day exceeded. Upgrade for higher limits.`,
          upgrade_url: "https://japanseasons.com/pricing",
        },
      },
      429
    );
  }

  // Increment KV counter (fire-and-forget)
  safeWaitUntil(
    c as unknown as Context,
    kv.put(kvKey, String(current + 1), { expirationTtl: 86400 })
  );

  // For PAYG tier: also record to D1 for Stripe billing
  if (tier === "payg") {
    safeWaitUntil(
      c as unknown as Context,
      recordUsageToD1(c.env.DB, keyHash)
    );
  }

  const remaining = Math.max(0, limit - current - 1);
  c.header("X-RateLimit-Limit", String(limit));
  c.header("X-RateLimit-Remaining", String(remaining));

  await next();
}

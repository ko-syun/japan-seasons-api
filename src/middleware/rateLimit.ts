import { Context, Next } from "hono";
import type { Env } from "../types.js";

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  pro: 10000,
  enterprise: 100000,
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

  if (current >= limit) {
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

  // Increment counter (fire-and-forget)
  c.executionCtx.waitUntil(
    kv.put(kvKey, String(current + 1), { expirationTtl: 86400 })
  );

  const remaining = Math.max(0, limit - current - 1);
  c.header("X-RateLimit-Limit", String(limit));
  c.header("X-RateLimit-Remaining", String(remaining));

  await next();
}

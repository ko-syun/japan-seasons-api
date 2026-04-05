import { Context, Next } from "hono";
import type { Env } from "../types.js";
import { safeWaitUntil } from "../utils/waitUntil.js";

interface RequestLogContext {
  Bindings: Env;
  Variables: {
    apiKeyTier: string;
    apiKeyHash: string;
  };
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Normalize a request path by replacing slug or numeric IDs with `:id`.
 * e.g. /v1/matsuri/gion-matsuri → /v1/matsuri/:id
 * e.g. /v1/matsuri/123          → /v1/matsuri/:id
 * e.g. /v1/sakura/status        → /v1/sakura/status (unchanged)
 */
function normalizeEndpoint(path: string): string {
  // Replace hyphenated slugs (e.g. gion-matsuri) and pure numbers with :id
  return path.replace(/\/([a-z0-9]+-[a-z0-9-]+|\d+)(?=\/|$)/g, "/:id");
}

async function upsertRequestStat(
  db: D1Database,
  date: string,
  endpoint: string,
  keyHash: string,
  tier: string,
  status: number
): Promise<void> {
  const is4xx = status >= 400 && status < 500 ? 1 : 0;
  const is5xx = status >= 500 ? 1 : 0;

  await db
    .prepare(
      `INSERT INTO daily_request_stats (date, endpoint, key_hash, tier, request_count, error_4xx, error_5xx)
       VALUES (?, ?, ?, ?, 1, ?, ?)
       ON CONFLICT(date, endpoint, key_hash)
       DO UPDATE SET
         request_count = request_count + 1,
         error_4xx = error_4xx + excluded.error_4xx,
         error_5xx = error_5xx + excluded.error_5xx`
    )
    .bind(date, endpoint, keyHash, tier, is4xx, is5xx)
    .run();
}

export async function requestLogMiddleware(
  c: Context<RequestLogContext>,
  next: Next
): Promise<void> {
  await next();

  const status = c.res.status;
  const endpoint = normalizeEndpoint(c.req.path);
  const keyHash = c.get("apiKeyHash") ?? "anonymous";
  const tier = c.get("apiKeyTier") ?? "free";
  const date = getToday();

  safeWaitUntil(
    c as unknown as Context,
    upsertRequestStat(c.env.DB, date, endpoint, keyHash, tier, status)
  );
}

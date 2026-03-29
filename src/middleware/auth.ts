import { Context, Next } from "hono";
import type { Env } from "../types.js";
import { safeWaitUntil } from "../utils/waitUntil.js";

interface AuthContext {
  Bindings: Env;
  Variables: {
    apiKeyTier: string;
    apiKeyHash: string;
  };
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function authMiddleware(
  c: Context<AuthContext>,
  next: Next
) {
  const apiKey =
    c.req.header("X-API-Key") ??
    c.req.query("api_key");

  if (!apiKey) {
    return c.json(
      {
        error: {
          code: "MISSING_API_KEY",
          message:
            "API key required. Pass via X-API-Key header or api_key query parameter.",
        },
      },
      401
    );
  }

  const keyHash = await hashApiKey(apiKey);
  const db = c.env.DB;

  const row = await db
    .prepare(
      "SELECT tier, is_active FROM api_keys WHERE key_hash = ?"
    )
    .bind(keyHash)
    .first<{ tier: string; is_active: number }>();

  if (!row || !row.is_active) {
    return c.json(
      {
        error: {
          code: "INVALID_API_KEY",
          message: "Invalid or deactivated API key.",
        },
      },
      403
    );
  }

  // Update last_used_at (fire-and-forget)
  safeWaitUntil(
    c as unknown as Context,
    db.prepare("UPDATE api_keys SET last_used_at = datetime('now') WHERE key_hash = ?")
      .bind(keyHash).run()
  );

  c.set("apiKeyTier", row.tier);
  c.set("apiKeyHash", keyHash);

  await next();
}

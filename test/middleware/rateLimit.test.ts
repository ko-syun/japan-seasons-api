import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function setupDb() {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY, name_en TEXT, name_ja TEXT,
      prefecture_en TEXT, prefecture_ja TEXT, region TEXT,
      latitude REAL, longitude REAL, tree_species TEXT DEFAULT 'somei_yoshino'
    );
    CREATE TABLE IF NOT EXISTS sakura_observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id TEXT, year INTEGER,
      bloom_date TEXT, full_bloom_date TEXT,
      bloom_status TEXT DEFAULT 'not_yet',
      normal_bloom_date TEXT, normal_full_bloom_date TEXT,
      diff_from_normal INTEGER,
      tree_species TEXT DEFAULT 'somei_yoshino',
      source TEXT DEFAULT 'jma',
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(location_id, year, source)
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      key_hash TEXT PRIMARY KEY, tier TEXT DEFAULT 'free',
      owner_email TEXT, created_at TEXT DEFAULT (datetime('now')),
      last_used_at TEXT, is_active INTEGER DEFAULT 1
    );
  `);

  const keyHash = await hashKey("test-key-123");
  await env.DB.exec(`
    INSERT OR IGNORE INTO api_keys (key_hash, tier, is_active)
    VALUES ('${keyHash}', 'free', 1);
  `);
}

describe("Rate Limiting", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("includes rate limit headers", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/locations", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBeDefined();
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("returns 429 when limit exceeded", async () => {
    // Set KV counter to max
    const keyHash = await hashKey("test-key-123");
    const today = new Date().toISOString().slice(0, 10);
    await env.KV.put(`ratelimit:${keyHash}:${today}`, "100", {
      expirationTtl: 86400,
    });

    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/locations", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(429);

    const body = await res.json() as Record<string, unknown>;
    const error = body.error as Record<string, unknown>;
    expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});

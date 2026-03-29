import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";

async function setupDb() {
  // Create tables
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_ja TEXT NOT NULL,
      prefecture_en TEXT NOT NULL,
      prefecture_ja TEXT NOT NULL,
      region TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      tree_species TEXT NOT NULL DEFAULT 'somei_yoshino'
    );
    CREATE TABLE IF NOT EXISTS sakura_observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      bloom_date TEXT,
      full_bloom_date TEXT,
      bloom_status TEXT DEFAULT 'not_yet',
      normal_bloom_date TEXT,
      normal_full_bloom_date TEXT,
      diff_from_normal INTEGER,
      tree_species TEXT DEFAULT 'somei_yoshino',
      source TEXT NOT NULL DEFAULT 'jma',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(location_id, year, source)
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      key_hash TEXT PRIMARY KEY,
      tier TEXT NOT NULL DEFAULT 'free',
      owner_email TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Seed test data
  await env.DB.exec(`
    INSERT OR IGNORE INTO locations VALUES
      ('tokyo', 'Tokyo', '東京', 'Tokyo', '東京都', 'kanto', 35.6894, 139.6917, 'somei_yoshino'),
      ('osaka', 'Osaka', '大阪', 'Osaka', '大阪府', 'kansai', 34.6937, 135.5023, 'somei_yoshino');
  `);

  await env.DB.exec(`
    INSERT OR IGNORE INTO sakura_observations (location_id, year, bloom_date, full_bloom_date, bloom_status, source, updated_at)
    VALUES
      ('tokyo', 2026, '2026-03-20', '2026-03-27', 'full_bloom', 'jma', datetime('now')),
      ('osaka', 2026, '2026-03-25', NULL, 'blooming', 'jma', datetime('now'));
  `);

  // Insert test API key (SHA-256 of "test-key-123")
  const keyHash = await hashKey("test-key-123");
  await env.DB.exec(`
    INSERT OR IGNORE INTO api_keys (key_hash, tier, is_active)
    VALUES ('${keyHash}', 'free', 1);
  `);
}

async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("GET /v1/sakura/status", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("returns 401 without API key", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/status"),
      env
    );
    expect(res.status).toBe(401);
  });

  it("returns status data with valid API key", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/status", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("meta");

    const data = body.data as Record<string, unknown>;
    expect(data).toHaveProperty("season");
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("stations");
  });

  it("filters by region", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/status?region=kanto", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    const data = body.data as Record<string, unknown>;
    const stations = data.stations as Array<Record<string, unknown>>;

    for (const station of stations) {
      const loc = station.location as Record<string, unknown>;
      expect(loc.region).toBe("kanto");
    }
  });
});

describe("GET /v1/sakura/locations", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("returns all locations", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/locations", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("meta");

    const data = body.data as Array<unknown>;
    expect(data.length).toBe(58);

    const meta = body.meta as Record<string, unknown>;
    expect(meta.total).toBe(58);
  });
});

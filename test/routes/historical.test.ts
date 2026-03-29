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

  await env.DB.exec(`
    INSERT OR IGNORE INTO locations VALUES
      ('tokyo', 'Tokyo', '東京', 'Tokyo', '東京都', 'kanto', 35.6894, 139.6917, 'somei_yoshino');
  `);

  // Insert multiple years of data
  for (let year = 2020; year <= 2025; year++) {
    const bloomDay = 14 + Math.floor(Math.random() * 15);
    await env.DB.exec(`
      INSERT OR IGNORE INTO sakura_observations (location_id, year, bloom_date, full_bloom_date, source, updated_at)
      VALUES ('tokyo', ${year}, '${year}-03-${String(bloomDay).padStart(2, "0")}', '${year}-04-01', 'jma', datetime('now'));
    `);
  }

  const keyHash = await hashKey("test-key-123");
  await env.DB.exec(`
    INSERT OR IGNORE INTO api_keys (key_hash, tier, is_active) VALUES ('${keyHash}', 'free', 1);
  `);
}

describe("GET /v1/sakura/historical", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("returns 400 without city param", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/historical", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown city", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/historical?city=atlantis", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(404);
  });

  it("returns historical data for tokyo", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/historical?city=tokyo", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    const data = body.data as Record<string, unknown>;

    expect(data.location).toBeDefined();
    expect(data.records).toBeDefined();
    expect(data.statistics).toBeDefined();

    const records = data.records as Array<Record<string, unknown>>;
    expect(records.length).toBeGreaterThan(0);

    const location = data.location as Record<string, unknown>;
    expect(location.id).toBe("tokyo");
  });

  it("filters by year range", async () => {
    const res = await app.fetch(
      new Request(
        "http://localhost/v1/sakura/historical?city=tokyo&from_year=2023&to_year=2025",
        { headers: { "X-API-Key": "test-key-123" } }
      ),
      env
    );
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    const data = body.data as Record<string, unknown>;
    const records = data.records as Array<Record<string, unknown>>;

    for (const rec of records) {
      expect(rec.year as number).toBeGreaterThanOrEqual(2023);
      expect(rec.year as number).toBeLessThanOrEqual(2025);
    }
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../../src/index.js";
import { createTables, seedApiKey } from "../../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
  await seedApiKey(env.DB, "test-key-123");

  await env.DB.exec("INSERT OR IGNORE INTO locations VALUES ('tokyo', 'Tokyo', '東京', 'Tokyo', '東京都', 'kanto', 35.6894, 139.6917, 'somei_yoshino')");

  for (let year = 2020; year <= 2025; year++) {
    const colorDay = String(10 + (year % 10)).padStart(2, "0");
    await env.DB.exec(`INSERT OR IGNORE INTO kouyou_observations (location_id, year, color_date, fall_date, source, updated_at) VALUES ('tokyo', ${year}, '${year}-11-${colorDay}', '${year}-12-05', 'jma', '${year}-12-15')`);
  }
}

describe("GET /v1/kouyou/historical", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("returns 400 without city param", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/historical", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown city", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/historical?city=atlantis", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(404);
  });

  it("returns historical data for tokyo", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/historical?city=tokyo", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
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
        "http://localhost/v1/kouyou/historical?city=tokyo&from_year=2023&to_year=2025",
        { headers: { "X-API-Key": "test-key-123" } }
      ),
      env
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    const data = body.data as Record<string, unknown>;
    const records = data.records as Array<Record<string, unknown>>;

    for (const rec of records) {
      expect(rec.year as number).toBeGreaterThanOrEqual(2023);
      expect(rec.year as number).toBeLessThanOrEqual(2025);
    }
  });
});

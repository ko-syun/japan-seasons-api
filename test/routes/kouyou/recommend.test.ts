import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../../src/index.js";
import { createTables, seedApiKey } from "../../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
  await seedApiKey(env.DB, "test-key-123");

  const cities = [
    "('tokyo', 'Tokyo', '東京', 'Tokyo', '東京都', 'kanto', 35.6894, 139.6917, 'somei_yoshino')",
    "('kyoto', 'Kyoto', '京都', 'Kyoto', '京都府', 'kansai', 35.0116, 135.7681, 'somei_yoshino')",
    "('osaka', 'Osaka', '大阪', 'Osaka', '大阪府', 'kansai', 34.6937, 135.5023, 'somei_yoshino')",
    "('sendai', 'Sendai', '仙台', 'Miyagi', '宮城県', 'tohoku', 38.2682, 140.8694, 'somei_yoshino')",
  ];
  for (const city of cities) {
    await env.DB.exec(`INSERT OR IGNORE INTO locations VALUES ${city}`);
  }

  const obsData: Array<[string, string, string]> = [
    ["tokyo", "11-15", "12-05"],
    ["kyoto", "11-20", "12-10"],
    ["osaka", "11-22", "12-08"],
    ["sendai", "11-05", "11-25"],
  ];

  for (let year = 2000; year <= 2025; year++) {
    for (const [id, color, fall] of obsData) {
      await env.DB.exec(`INSERT OR IGNORE INTO kouyou_observations (location_id, year, color_date, fall_date, source, updated_at) VALUES ('${id}', ${year}, '${year}-${color}', '${year}-${fall}', 'jma', '${year}-12-20')`);
    }
  }
}

describe("GET /v1/kouyou/recommend", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("returns recommendation for a city", async () => {
    const res = await app.fetch(
      new Request(
        "http://localhost/v1/kouyou/recommend?city=kyoto&dates=2026-11-10/2026-11-25",
        { headers: { "X-API-Key": "test-key-123" } }
      ),
      env
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    const data = body.data as Record<string, unknown>;

    expect(data.query).toBeDefined();
    expect(data.recommendation).toBeDefined();

    const rec = data.recommendation as Record<string, unknown>;
    expect(rec.likelihood).toBeDefined();
    expect(rec.confidence).toBeDefined();
    expect(rec.summary).toBeDefined();
    expect(rec.best_days).toBeDefined();
    expect(rec.alternatives).toBeDefined();
  });

  it("returns 404 for invalid city", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/recommend?city=narnia", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(404);
  });
});

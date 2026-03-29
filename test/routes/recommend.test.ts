import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";
import { createTables, seedApiKey } from "../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
  await seedApiKey(env.DB, "test-key-123");

  const cities = [
    "('tokyo', 'Tokyo', '東京', 'Tokyo', '東京都', 'kanto', 35.6894, 139.6917, 'somei_yoshino')",
    "('kyoto', 'Kyoto', '京都', 'Kyoto', '京都府', 'kansai', 35.0116, 135.7681, 'somei_yoshino')",
    "('osaka', 'Osaka', '大阪', 'Osaka', '大阪府', 'kansai', 34.6937, 135.5023, 'somei_yoshino')",
    "('fukuoka', 'Fukuoka', '福岡', 'Fukuoka', '福岡県', 'kyushu', 33.5902, 130.4017, 'somei_yoshino')",
    "('sendai', 'Sendai', '仙台', 'Miyagi', '宮城県', 'tohoku', 38.2682, 140.8694, 'somei_yoshino')",
  ];
  for (const city of cities) {
    await env.DB.exec(`INSERT OR IGNORE INTO locations VALUES ${city}`);
  }

  const obsData: Array<[string, string, string]> = [
    ["tokyo", "03-22", "03-30"],
    ["kyoto", "03-26", "04-03"],
    ["osaka", "03-25", "04-02"],
    ["fukuoka", "03-20", "03-28"],
    ["sendai", "04-08", "04-14"],
  ];

  for (let year = 2000; year <= 2025; year++) {
    for (const [id, bloom, full] of obsData) {
      await env.DB.exec(`INSERT OR IGNORE INTO sakura_observations (location_id, year, bloom_date, full_bloom_date, source, updated_at) VALUES ('${id}', ${year}, '${year}-${bloom}', '${year}-${full}', 'jma', '${year}-04-15')`);
    }
  }
}

describe("GET /v1/sakura/recommend", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("returns recommendation for a city", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/recommend?city=kyoto&dates=2026-03-25/2026-04-05", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
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
      new Request("http://localhost/v1/sakura/recommend?city=narnia", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(404);
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";
import { createTables, seedApiKey, seedLocations } from "../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
  await seedLocations(env.DB);
  await seedApiKey(env.DB, "test-key-123");

  for (let year = 2000; year <= 2025; year++) {
    const bloomDay = String(20 + (year % 5)).padStart(2, "0");
    const fullDay = String(28 + (year % 3)).padStart(2, "0");
    await env.DB.exec(`INSERT OR IGNORE INTO sakura_observations (location_id, year, bloom_date, full_bloom_date, source, updated_at) VALUES ('tokyo', ${year}, '${year}-03-${bloomDay}', '${year}-03-${fullDay}', 'jma', '${year}-04-01')`);
    const kBloom = String(24 + (year % 5)).padStart(2, "0");
    const kFull = String(2 + (year % 3)).padStart(2, "0");
    await env.DB.exec(`INSERT OR IGNORE INTO sakura_observations (location_id, year, bloom_date, full_bloom_date, source, updated_at) VALUES ('kyoto', ${year}, '${year}-03-${kBloom}', '${year}-04-${kFull}', 'jma', '${year}-04-01')`);
  }
}

describe("GET /v1/sakura/forecast", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("returns forecast for all locations", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/forecast", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty("data");

    const data = body.data as Record<string, unknown>;
    expect(data).toHaveProperty("season");
    expect(data).toHaveProperty("note");
    expect(data).toHaveProperty("locations");
  });

  it("filters by city", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/sakura/forecast?city=kyoto", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = await res.json() as Record<string, unknown>;
    const data = body.data as Record<string, unknown>;
    const locations = data.locations as Array<Record<string, unknown>>;

    expect(locations.length).toBe(1);
    const loc = locations[0].location as Record<string, unknown>;
    expect(loc.id).toBe("kyoto");
  });
});

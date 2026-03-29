import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../../src/index.js";
import { createTables, seedApiKey, seedLocations } from "../../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
  await seedLocations(env.DB);
  await seedApiKey(env.DB, "test-key-123");

  for (let year = 2000; year <= 2025; year++) {
    const colorDay = String(10 + (year % 5)).padStart(2, "0");
    const fallDay = String(1 + (year % 3)).padStart(2, "0");
    await env.DB.exec(`INSERT OR IGNORE INTO kouyou_observations (location_id, year, color_date, fall_date, source, updated_at) VALUES ('tokyo', ${year}, '${year}-11-${colorDay}', '${year}-12-${fallDay}', 'jma', '${year}-12-15')`);
    const kColor = String(18 + (year % 5)).padStart(2, "0");
    const kFall = String(5 + (year % 3)).padStart(2, "0");
    await env.DB.exec(`INSERT OR IGNORE INTO kouyou_observations (location_id, year, color_date, fall_date, source, updated_at) VALUES ('kyoto', ${year}, '${year}-11-${kColor}', '${year}-12-${kFall}', 'jma', '${year}-12-15')`);
  }
}

describe("GET /v1/kouyou/forecast", () => {
  beforeAll(async () => {
    await setupDb();
  });

  it("returns forecast for all locations", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/forecast", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("data");

    const data = body.data as Record<string, unknown>;
    expect(data).toHaveProperty("season");
    expect(data).toHaveProperty("note");
    expect(data).toHaveProperty("locations");
  });

  it("filters by city", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/forecast?city=kyoto", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    const data = body.data as Record<string, unknown>;
    const locations = data.locations as Array<Record<string, unknown>>;

    expect(locations.length).toBe(1);
    const loc = locations[0].location as Record<string, unknown>;
    expect(loc.id).toBe("kyoto");
  });
});

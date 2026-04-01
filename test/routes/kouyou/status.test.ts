import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import app from "../../../src/index.js";
import { createTables, seedApiKey, seedLocations, hashKey } from "../../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
  await seedLocations(env.DB);
  await seedApiKey(env.DB, "test-key-123");

  // Clean up any rate limit pollution from other test suites
  const keyHash = await hashKey("test-key-123");
  const today = new Date().toISOString().slice(0, 10);
  await env.KV.delete(`ratelimit:${keyHash}:${today}`);

  await env.DB.exec("INSERT OR IGNORE INTO kouyou_observations (location_id, year, color_date, fall_date, color_status, source, updated_at) VALUES ('tokyo', 2026, '2026-11-15', '2026-12-01', 'peak_color', 'jma', '2026-11-20')");
  await env.DB.exec("INSERT OR IGNORE INTO kouyou_observations (location_id, year, color_date, fall_date, color_status, source, updated_at) VALUES ('osaka', 2026, '2026-11-20', NULL, 'coloring', 'jma', '2026-11-20')");
}

describe("GET /v1/kouyou/status", () => {
  beforeEach(async () => {
    // Clean rate limit pollution from other suites
    const keyHash = await hashKey("test-key-123");
    const today = new Date().toISOString().slice(0, 10);
    await env.KV.delete(`ratelimit:${keyHash}:${today}`);
  });

  beforeAll(async () => {
    await setupDb();
  });

  it("returns 401 without API key", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/status"),
      env
    );
    expect(res.status).toBe(401);
  });

  it("returns status data with valid API key", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/status", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("meta");

    const data = body.data as Record<string, unknown>;
    expect(data).toHaveProperty("season");
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("stations");
  });

  it("filters by region", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/kouyou/status?region=kanto", {
        headers: { "X-API-Key": "test-key-123" },
      }),
      env
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    const data = body.data as Record<string, unknown>;
    const stations = data.stations as Array<Record<string, unknown>>;

    for (const station of stations) {
      const loc = station.location as Record<string, unknown>;
      expect(loc.region).toBe("kanto");
    }
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";
import { createTables, seedApiKey, seedLocations } from "../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
  await seedLocations(env.DB);
  await seedApiKey(env.DB, "test-key-123");

  await env.DB.exec("INSERT OR IGNORE INTO sakura_observations (location_id, year, bloom_date, full_bloom_date, bloom_status, source, updated_at) VALUES ('tokyo', 2026, '2026-03-20', '2026-03-27', 'full_bloom', 'jma', '2026-03-29')");
  await env.DB.exec("INSERT OR IGNORE INTO sakura_observations (location_id, year, bloom_date, full_bloom_date, bloom_status, source, updated_at) VALUES ('osaka', 2026, '2026-03-25', NULL, 'blooming', 'jma', '2026-03-29')");
}

describe("GET /v1/sakura/status", () => {
  beforeAll(async () => {
    await setupDb();
    // Clear KV rate-limit pollution from other test suites
    const crypto = await import("node:crypto");
    const keyHash = crypto.createHash("sha256").update("test-key-123").digest("hex").slice(0, 16);
    const today = new Date().toISOString().slice(0, 10);
    await env.KV.delete(`ratelimit:${keyHash}:${today}`);
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

  it("returns locations from DB", async () => {
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
    expect(data.length).toBeGreaterThanOrEqual(1);
  });
});

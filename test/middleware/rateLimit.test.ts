import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";
import { createTables, seedApiKey, hashKey } from "../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
  await seedApiKey(env.DB, "test-key-123");
}

describe("Rate Limiting", () => {
  let kvKey: string;

  beforeAll(async () => {
    await setupDb();
    const keyHash = await hashKey("test-key-123");
    const today = new Date().toISOString().slice(0, 10);
    kvKey = `ratelimit:${keyHash}:${today}`;
  });

  afterAll(async () => {
    // Clean up so other tests aren't rate-limited
    await env.KV.delete(kvKey);
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
    await env.KV.put(kvKey, "100", { expirationTtl: 86400 });

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

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";
import { createTables, seedApiKey } from "../helpers/setupDb.js";

const API_KEY = "test-key-123";

async function setupMatsuriDb() {
  await createTables(env.DB);
  await seedApiKey(env.DB, API_KEY);

  // Create matsuri table
  await env.DB.exec("CREATE TABLE IF NOT EXISTS matsuri (id TEXT PRIMARY KEY, name_en TEXT NOT NULL, name_ja TEXT NOT NULL, city TEXT NOT NULL, prefecture TEXT NOT NULL, region TEXT NOT NULL, month INTEGER NOT NULL, date_start TEXT, date_end TEXT, highlight_dates TEXT, category TEXT NOT NULL, description_en TEXT, description_ja TEXT, estimated_visitors INTEGER, access TEXT, latitude REAL, longitude REAL, tips_en TEXT, official_url TEXT, is_active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL)");

  // Seed test festivals
  await env.DB.exec(`INSERT OR IGNORE INTO matsuri VALUES ('gion-matsuri', 'Gion Matsuri', '祇園祭', 'Kyoto', 'Kyoto', 'kansai', 7, '07-01', '07-31', '["07-17","07-24"]', '["float","traditional"]', 'Great festival in Kyoto', '京都の大祭', 800000, 'JR Kyoto Station', 35.0036, 135.7691, 'Book early', 'https://www.gionmatsuri.or.jp/', 1, '2026-03-29T00:00:00Z')`);

  await env.DB.exec(`INSERT OR IGNORE INTO matsuri VALUES ('aomori-nebuta', 'Aomori Nebuta Festival', '青森ねぶた祭', 'Aomori', 'Aomori', 'tohoku', 8, '08-02', '08-07', '["08-02","08-07"]', '["float","lantern","dance"]', 'Nebuta floats parade', 'ねぶた祭り', 2800000, 'JR Aomori Station', 40.8244, 140.7400, 'Join as haneto', 'https://www.nebuta.jp/', 1, '2026-03-29T00:00:00Z')`);

  await env.DB.exec(`INSERT OR IGNORE INTO matsuri VALUES ('sapporo-snow-festival', 'Sapporo Snow Festival', 'さっぽろ雪まつり', 'Sapporo', 'Hokkaido', 'hokkaido', 2, '02-04', '02-11', '["02-04","02-11"]', '["snow","modern"]', 'Snow sculptures', '雪まつり', 2000000, 'Sapporo Subway', 43.0589, 141.3544, 'Dress warmly', 'https://www.snowfes.com/', 1, '2026-03-29T00:00:00Z')`);

  await env.DB.exec(`INSERT OR IGNORE INTO matsuri VALUES ('chichibu-night-festival', 'Chichibu Night Festival', '秩父夜祭', 'Chichibu', 'Saitama', 'kanto', 12, '12-02', '12-03', '["12-03"]', '["float","fire","traditional"]', 'Night festival with floats', '秩父夜祭', 200000, 'Seibu Railway', 35.9917, 139.0858, 'Arrive early', 'https://www.chichibu-matsuri.jp/', 1, '2026-03-29T00:00:00Z')`);

  await env.DB.exec(`INSERT OR IGNORE INTO matsuri VALUES ('inactive-festival', 'Inactive Festival', '非アクティブ祭り', 'Nowhere', 'Nowhere', 'kanto', 6, '06-01', '06-01', '[]', '["traditional"]', 'Inactive', '非アクティブ', 0, '', 0, 0, '', '', 0, '2026-03-29T00:00:00Z')`);
}

describe("Matsuri API", () => {
  beforeAll(async () => {
    await setupMatsuriDb();
  });

  // ── Auth ──

  describe("Authentication", () => {
    it("returns 401 without API key", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search"),
        env
      );
      expect(res.status).toBe(401);
    });
  });

  // ── GET /v1/matsuri/search ──

  describe("GET /v1/matsuri/search", () => {
    it("returns all active festivals by default", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("meta");

      const data = body.data as unknown[];
      // Should not include the inactive festival
      expect(data.length).toBe(4);

      const meta = body.meta as Record<string, unknown>;
      expect(meta.total).toBe(4);
    });

    it("filters by region", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search?region=kansai", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      const data = body.data as Array<Record<string, unknown>>;
      expect(data.length).toBe(1);
      expect(data[0].id).toBe("gion-matsuri");
    });

    it("filters by month", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search?month=8", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      const data = body.data as Array<Record<string, unknown>>;
      expect(data.length).toBe(1);
      expect(data[0].id).toBe("aomori-nebuta");
    });

    it("filters by category", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search?category=snow", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      const data = body.data as Array<Record<string, unknown>>;
      expect(data.length).toBe(1);
      expect(data[0].id).toBe("sapporo-snow-festival");
    });

    it("filters by city", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search?city=Kyoto", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      const data = body.data as Array<Record<string, unknown>>;
      expect(data.length).toBe(1);
      expect(data[0].id).toBe("gion-matsuri");
    });

    it("returns 400 for invalid month", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search?month=13", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(400);
    });

    it("respects limit and offset", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search?limit=2&offset=0", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      const data = body.data as unknown[];
      expect(data.length).toBe(2);

      const meta = body.meta as Record<string, unknown>;
      expect(meta.total).toBe(4);
      expect(meta.limit).toBe(2);
      expect(meta.offset).toBe(0);
    });

    it("parses category and highlight_dates as arrays", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/search?region=kansai", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      const data = body.data as Array<Record<string, unknown>>;
      expect(Array.isArray(data[0].category)).toBe(true);
      expect(Array.isArray(data[0].highlight_dates)).toBe(true);
      expect(data[0].category).toEqual(["float", "traditional"]);
      expect(data[0].highlight_dates).toEqual(["07-17", "07-24"]);
    });
  });

  // ── GET /v1/matsuri/upcoming ──

  describe("GET /v1/matsuri/upcoming", () => {
    it("returns upcoming festivals", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/upcoming?days=365", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("meta");

      const meta = body.meta as Record<string, unknown>;
      expect(meta.days).toBe(365);
    });

    it("filters by region", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/upcoming?days=365&region=hokkaido", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      const data = body.data as Array<Record<string, unknown>>;
      for (const festival of data) {
        expect(festival.region).toBe("hokkaido");
      }
    });
  });

  // ── GET /v1/matsuri/:id ──

  describe("GET /v1/matsuri/:id", () => {
    it("returns a single festival by ID", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/gion-matsuri", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      const data = body.data as Record<string, unknown>;
      expect(data.id).toBe("gion-matsuri");
      expect(data.name_en).toBe("Gion Matsuri");
      expect(data.name_ja).toBe("祇園祭");
      expect(data.region).toBe("kansai");
      expect(Array.isArray(data.category)).toBe(true);
      expect(Array.isArray(data.highlight_dates)).toBe(true);
    });

    it("returns 404 for non-existent festival", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/nonexistent", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(404);
    });

    it("returns 404 for inactive festival", async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/matsuri/inactive-festival", {
          headers: { "X-API-Key": API_KEY },
        }),
        env
      );
      expect(res.status).toBe(404);
    });
  });
});

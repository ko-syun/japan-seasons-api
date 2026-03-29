import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";
import { createTables } from "../helpers/setupDb.js";

const TEST_ENV = { ...env, JWT_SECRET: "test-jwt-secret-key" } as typeof env;
let token: string;

function req(path: string, options?: RequestInit) {
  return app.fetch(
    new Request(`http://localhost/dashboard${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    }),
    TEST_ENV
  );
}

async function signup(): Promise<string> {
  const res = await app.fetch(
    new Request("http://localhost/dashboard/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `keys-test-${Date.now()}@example.com`,
        password: "password123",
      }),
    }),
    TEST_ENV
  );
  const data = (await res.json()) as { data: { token: string } };
  return data.data.token;
}

describe("Dashboard Keys", () => {
  beforeAll(async () => {
    await createTables(env.DB);
    token = await signup();
  });

  describe("POST /dashboard/api/keys", () => {
    it("creates a new API key and returns plaintext", async () => {
      const res = await req("/api/keys", {
        method: "POST",
        body: JSON.stringify({ name: "test-key" }),
      });
      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        data: { id: string; name: string; key: string; tier: string };
      };
      expect(data.data.key).toMatch(/^jsapi_/);
      expect(data.data.name).toBe("test-key");
      expect(data.data.tier).toBe("free");
    });

    it("rejects unauthenticated requests", async () => {
      const res = await app.fetch(
        new Request("http://localhost/dashboard/api/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "no-auth" }),
        }),
        TEST_ENV
      );
      expect(res.status).toBe(401);
    });
  });

  describe("GET /dashboard/api/keys", () => {
    it("lists user keys", async () => {
      const res = await req("/api/keys");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: { keys: Array<{ name: string; is_active: boolean }> };
      };
      expect(data.data.keys.length).toBeGreaterThanOrEqual(1);
      expect(data.data.keys[0].is_active).toBe(true);
    });
  });

  describe("DELETE /dashboard/api/keys/:id", () => {
    it("revokes a key", async () => {
      // Create a key first
      const createRes = await req("/api/keys", {
        method: "POST",
        body: JSON.stringify({ name: "to-revoke" }),
      });
      const created = (await createRes.json()) as {
        data: { id: string };
      };

      const res = await req(`/api/keys/${created.data.id}`, {
        method: "DELETE",
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: { id: string; revoked: boolean };
      };
      expect(data.data.revoked).toBe(true);

      // Verify it's revoked in the list
      const listRes = await req("/api/keys");
      const listData = (await listRes.json()) as {
        data: {
          keys: Array<{ id: string; is_active: boolean }>;
        };
      };
      const revokedKey = listData.data.keys.find(
        (k) => k.id === created.data.id
      );
      expect(revokedKey?.is_active).toBe(false);
    });

    it("returns 404 for non-existent key", async () => {
      const res = await req("/api/keys/non-existent-id", {
        method: "DELETE",
      });
      expect(res.status).toBe(404);
    });
  });
});

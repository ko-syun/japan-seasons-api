import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import app from "../../src/index.js";
import { createTables } from "../helpers/setupDb.js";

async function setupDb() {
  await createTables(env.DB);
}

function req(path: string, options?: RequestInit) {
  return app.fetch(
    new Request(`http://localhost/dashboard${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    }),
    { ...env, JWT_SECRET: "test-jwt-secret-key" } as typeof env
  );
}

describe("Dashboard Auth", () => {
  beforeAll(async () => {
    await setupDb();
  });

  describe("POST /dashboard/api/signup", () => {
    it("creates a new account", async () => {
      const res = await req("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
      expect(res.status).toBe(201);
      const data = await res.json() as { data: { user: { email: string; tier: string }; token: string } };
      expect(data.data.user.email).toBe("test@example.com");
      expect(data.data.user.tier).toBe("free");
      expect(data.data.token).toBeTruthy();
    });

    it("rejects duplicate email", async () => {
      const res = await req("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
      expect(res.status).toBe(409);
      const data = await res.json() as { error: { code: string } };
      expect(data.error.code).toBe("EMAIL_EXISTS");
    });

    it("rejects short password", async () => {
      const res = await req("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email: "short@example.com", password: "abc" }),
      });
      expect(res.status).toBe(400);
    });

    it("rejects missing fields", async () => {
      const res = await req("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email: "only@email.com" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /dashboard/api/login", () => {
    it("logs in with valid credentials", async () => {
      const res = await req("/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { data: { user: { email: string }; token: string } };
      expect(data.data.user.email).toBe("test@example.com");
      expect(data.data.token).toBeTruthy();
    });

    it("rejects wrong password", async () => {
      const res = await req("/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" }),
      });
      expect(res.status).toBe(401);
      const data = await res.json() as { error: { code: string } };
      expect(data.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects non-existent email", async () => {
      const res = await req("/api/login", {
        method: "POST",
        body: JSON.stringify({ email: "nobody@example.com", password: "password123" }),
      });
      expect(res.status).toBe(401);
      const data = await res.json() as { error: { code: string } };
      expect(data.error.code).toBe("INVALID_CREDENTIALS");
    });
  });
});

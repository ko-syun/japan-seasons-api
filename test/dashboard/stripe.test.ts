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

describe("Dashboard Stripe", () => {
  beforeAll(async () => {
    await createTables(env.DB);
    // Signup
    const res = await app.fetch(
      new Request("http://localhost/dashboard/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `stripe-test-${Date.now()}@example.com`,
          password: "password123",
        }),
      }),
      TEST_ENV
    );
    const data = (await res.json()) as { data: { token: string } };
    token = data.data.token;
  });

  describe("POST /dashboard/api/checkout", () => {
    it("returns 503 when STRIPE_SECRET_KEY is not set", async () => {
      const res = await req("/api/checkout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(503);
      const data = (await res.json()) as { error: { code: string } };
      expect(data.error.code).toBe("BILLING_UNAVAILABLE");
    });

    it("rejects unauthenticated requests", async () => {
      const res = await app.fetch(
        new Request("http://localhost/dashboard/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
        TEST_ENV
      );
      expect(res.status).toBe(401);
    });
  });

  describe("POST /dashboard/api/portal", () => {
    it("returns 503 when STRIPE_SECRET_KEY is not set", async () => {
      const res = await req("/api/portal", { method: "POST" });
      expect(res.status).toBe(503);
      const data = (await res.json()) as { error: { code: string } };
      expect(data.error.code).toBe("BILLING_UNAVAILABLE");
    });
  });

  describe("POST /dashboard/api/webhooks/stripe", () => {
    it("returns 503 when STRIPE_WEBHOOK_SECRET is not set", async () => {
      const res = await app.fetch(
        new Request("http://localhost/dashboard/api/webhooks/stripe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Stripe-Signature": "t=123,v1=abc",
          },
          body: JSON.stringify({ type: "test" }),
        }),
        TEST_ENV
      );
      expect(res.status).toBe(503);
    });

    it("returns 400 without Stripe-Signature header", async () => {
      const envWithWebhook = {
        ...TEST_ENV,
        STRIPE_WEBHOOK_SECRET: "whsec_test",
      } as typeof env;
      const res = await app.fetch(
        new Request("http://localhost/dashboard/api/webhooks/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "test" }),
        }),
        envWithWebhook
      );
      expect(res.status).toBe(400);
      const data = (await res.json()) as { error: { code: string } };
      expect(data.error.code).toBe("INVALID_SIGNATURE");
    });
  });
});

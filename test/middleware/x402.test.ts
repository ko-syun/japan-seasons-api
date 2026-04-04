import { describe, it, expect } from "vitest";
import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import app from "../../src/index.js";

describe("x402 middleware", () => {
  it("returns 402 with payment requirements when no API key and X402_PAYTO_ADDRESS is set", async () => {
    const testEnv = {
      ...env,
      X402_PAYTO_ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
    };
    const req = new Request("https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo");
    const ctx = createExecutionContext();
    const res = await app.fetch(req, testEnv, ctx);
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(402);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty("x402Version", 1);
    expect(body).toHaveProperty("accepts");
    const accepts = body.accepts as Array<Record<string, unknown>>;
    expect(accepts).toHaveLength(1);
    expect(accepts[0]).toHaveProperty("scheme", "exact");
    expect(accepts[0]).toHaveProperty("network", "base");
    expect(accepts[0]).toHaveProperty("payTo", "0x1234567890abcdef1234567890abcdef12345678");
    expect(accepts[0]).toHaveProperty("maxAmountRequired", "1000"); // forecast = 1000
  });

  it("falls through to auth when X402_PAYTO_ADDRESS is not set", async () => {
    const req = new Request("https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo");
    const ctx = createExecutionContext();
    const res = await app.fetch(req, env, ctx);
    await waitOnExecutionContext(ctx);

    // Should get 401 (missing API key) not 402
    expect(res.status).toBe(401);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty("error");
  });

  it("passes through when API key is present (existing auth flow)", async () => {
    const testEnv = {
      ...env,
      X402_PAYTO_ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
    };
    const req = new Request("https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo", {
      headers: { "X-API-Key": "invalid-key" },
    });
    const ctx = createExecutionContext();
    const res = await app.fetch(req, testEnv, ctx);
    await waitOnExecutionContext(ctx);

    // Should NOT get 402 — x402 is skipped when API key is present
    // May get 403 (invalid key) or 500 (DB not available in test env)
    expect(res.status).not.toBe(402);
  });

  it("returns 400 for malformed payment header", async () => {
    const testEnv = {
      ...env,
      X402_PAYTO_ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
    };
    const req = new Request("https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo", {
      headers: { "X-PAYMENT": "not-valid-json-or-base64" },
    });
    const ctx = createExecutionContext();
    const res = await app.fetch(req, testEnv, ctx);
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    const error = body.error as Record<string, unknown>;
    expect(error.code).toBe("PAYMENT_MALFORMED");
  });

  it("rejects payment with wrong payTo address via pre-check", async () => {
    const testEnv = {
      ...env,
      X402_PAYTO_ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
    };
    // Create a payment payload with a mismatched payTo
    const paymentPayload = {
      payload: {
        payTo: "0xWRONGADDRESS000000000000000000000000000",
        amount: "1000",
        network: "base",
      },
      signature: "0xfakesignature",
    };
    const encoded = btoa(JSON.stringify(paymentPayload));
    const req = new Request("https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo", {
      headers: { "X-PAYMENT": encoded },
    });
    const ctx = createExecutionContext();
    const res = await app.fetch(req, testEnv, ctx);
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(402);
    const body = (await res.json()) as Record<string, unknown>;
    const error = body.error as Record<string, unknown>;
    expect(error.code).toBe("PAYMENT_INVALID");
    expect(error.message).toContain("payTo");
  });

  it("rejects payment with wrong network via pre-check", async () => {
    const testEnv = {
      ...env,
      X402_PAYTO_ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
    };
    const paymentPayload = {
      payload: {
        payTo: "0x1234567890abcdef1234567890abcdef12345678",
        amount: "1000",
        network: "ethereum-mainnet",
      },
      signature: "0xfakesignature",
    };
    const encoded = btoa(JSON.stringify(paymentPayload));
    const req = new Request("https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo", {
      headers: { "X-PAYMENT": encoded },
    });
    const ctx = createExecutionContext();
    const res = await app.fetch(req, testEnv, ctx);
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(402);
    const body = (await res.json()) as Record<string, unknown>;
    const error = body.error as Record<string, unknown>;
    expect(error.code).toBe("PAYMENT_INVALID");
    expect(error.message).toContain("network");
  });

  it("/x402/info returns pricing info without auth", async () => {
    const testEnv = {
      ...env,
      X402_PAYTO_ADDRESS: "0xTestAddress",
    };
    const req = new Request("https://jpseasons.dokos.dev/x402/info");
    const ctx = createExecutionContext();
    const res = await app.fetch(req, testEnv, ctx);
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty("x402Version", 1);
    expect(body).toHaveProperty("supportedNetworks");
    expect(body).toHaveProperty("pricing");
    expect(body).toHaveProperty("payTo", "0xTestAddress");
    expect(body).toHaveProperty("paymentAccepted", true);
    expect(body).toHaveProperty("facilitator");
  });

  it("/x402/info shows paymentAccepted:false when no payTo", async () => {
    const req = new Request("https://jpseasons.dokos.dev/x402/info");
    const ctx = createExecutionContext();
    const res = await app.fetch(req, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toHaveProperty("paymentAccepted", false);
  });
});

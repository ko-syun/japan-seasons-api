import { Context, Next } from "hono";
import type { Env } from "../types.js";
import { HTTPFacilitatorClient } from "@x402/core/server";
import type { PaymentPayload, PaymentRequirements } from "@x402/core/types";
import { safeWaitUntil } from "../utils/waitUntil.js";

// Pricing per endpoint path (in USDC base units, 6 decimals)
// e.g. 500 = 0.0005 USDC, 1000 = 0.001 USDC
const ENDPOINT_PRICES: Record<string, number> = {
  "/v1/sakura/locations": 500,
  "/v1/sakura/status": 1000,
  "/v1/sakura/forecast": 1000,
  "/v1/sakura/historical": 2000,
  "/v1/sakura/recommend": 2000,
  "/v1/kouyou/locations": 500,
  "/v1/kouyou/status": 1000,
  "/v1/kouyou/forecast": 1000,
  "/v1/kouyou/historical": 2000,
  "/v1/kouyou/recommend": 2000,
  "/v1/matsuri/search": 1000,
  "/v1/matsuri/upcoming": 1000,
};

// USDC contract on Base mainnet
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// x402 network identifier for Base mainnet
const NETWORK = "base";

// Default facilitator URL (x402.org public facilitator)
const FACILITATOR_URL = "https://x402.org/facilitator";

// Lazy-initialized facilitator client (shared across requests)
let facilitatorClient: HTTPFacilitatorClient | null = null;

function getFacilitatorClient(): HTTPFacilitatorClient {
  if (!facilitatorClient) {
    facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
  }
  return facilitatorClient;
}

/**
 * x402 Payment Protocol middleware.
 *
 * Flow:
 * 1. If X-API-Key header present → skip (existing auth handles it)
 * 2. If payment header present → verify via facilitator, settle, serve request
 * 3. Neither → return HTTP 402 with payment requirements
 */
export async function x402Middleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  // If API key is present, skip x402 — existing auth flow handles it
  const apiKey = c.req.header("X-API-Key") ?? c.req.query("api_key");
  if (apiKey) {
    return next();
  }

  const payTo = c.env.X402_PAYTO_ADDRESS;

  // If x402 is not configured (no payTo address), fall through to regular auth
  if (!payTo) {
    return next();
  }

  // Check for payment header (v2: PAYMENT-SIGNATURE, v1: X-PAYMENT)
  const paymentHeader =
    c.req.header("PAYMENT-SIGNATURE") ??
    c.req.header("X-PAYMENT");

  if (!paymentHeader) {
    // Return 402 with payment requirements per x402 spec
    const path = new URL(c.req.url).pathname;
    const price = getPrice(path);

    return c.json(
      {
        x402Version: 1,
        accepts: [
          {
            scheme: "exact",
            network: NETWORK,
            maxAmountRequired: String(price),
            resource: c.req.url,
            payTo,
            maxTimeoutSeconds: 60,
            asset: USDC_BASE,
            extra: {
              name: "Japan Seasons API",
              description: `Access to ${path}`,
            },
          },
        ],
      },
      402
    );
  }

  // ── Payment verification via x402 facilitator ──
  try {
    const paymentPayload = parsePaymentPayload(paymentHeader);

    if (!paymentPayload) {
      return c.json(
        {
          error: {
            code: "PAYMENT_MALFORMED",
            message:
              "Payment header is malformed. Expected base64-encoded JSON payment payload.",
          },
        },
        400
      );
    }

    // Build payment requirements for this request
    const path = new URL(c.req.url).pathname;
    const requiredAmount = getPrice(path);

    const paymentRequirements: PaymentRequirements = {
      scheme: "exact",
      network: NETWORK as PaymentRequirements["network"],
      amount: String(requiredAmount),
      payTo,
      maxTimeoutSeconds: 60,
      asset: USDC_BASE,
      extra: {
        name: "Japan Seasons API",
        description: `Access to ${path}`,
      },
    };

    // Quick structural pre-checks before calling facilitator
    const preCheckError = preCheckPayment(paymentPayload, payTo, requiredAmount);
    if (preCheckError) {
      return c.json(
        {
          error: {
            code: "PAYMENT_INVALID",
            message: preCheckError,
          },
        },
        402
      );
    }

    // Replay attack prevention: hash the signature and check KV
    // Use the full payment payload as replay key (covers all signature variants)
    const signatureStr = JSON.stringify(paymentPayload);
    const sigData = new TextEncoder().encode(signatureStr);
    const sigHashBuf = await crypto.subtle.digest("SHA-256", sigData);
    const sigHash = Array.from(new Uint8Array(sigHashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const replayKey = `x402:sig:${sigHash}`;

    const existing = await c.env.KV.get(replayKey);
    if (existing) {
      return c.json(
        {
          error: {
            code: "PAYMENT_REPLAY",
            message: "This payment signature has already been used.",
          },
        },
        402
      );
    }

    // Verify payment via facilitator
    const client = getFacilitatorClient();
    const verifyResult = await client.verify(
      paymentPayload,
      paymentRequirements,
    );

    if (!verifyResult.isValid) {
      return c.json(
        {
          error: {
            code: "PAYMENT_INVALID",
            message: verifyResult.invalidReason ?? "Payment verification failed.",
          },
        },
        402
      );
    }

    // Mark signature as used (TTL: 24 hours — ERC-3009 nonces prevent on-chain replay,
    // this is an additional off-chain layer)
    await c.env.KV.put(replayKey, "1", { expirationTtl: 86400 });

    // Payment verified — flag for auth middleware to skip API key check
    c.set("x402Paid" as never, true as never);

    // Execute the route handler
    await next();

    // After route handler: settle the payment on-chain via facilitator
    // Only settle if the response was successful (2xx)
    if (c.res && c.res.status < 400) {
      try {
        const settleResult = await client.settle(
          paymentPayload,
          paymentRequirements,
        );

        // Add settlement info to response headers
        if (settleResult.success && settleResult.transaction) {
          c.header("X-Payment-Transaction", settleResult.transaction);
          c.header("X-Payment-Network", settleResult.network ?? NETWORK);
        }

        // Log x402 payment to D1 (fire-and-forget)
        const txHash = settleResult.transaction ?? null;
        safeWaitUntil(
          c as unknown as Context,
          insertX402Payment(c.env.DB, path, requiredAmount, txHash)
        );

        if (!settleResult.success) {
          // Settlement failed — log but don't fail the response
          // The payment was verified, so the user should still get their data
          console.error(
            `x402 settlement failed: ${settleResult.errorReason ?? "unknown"}`,
          );
        }
      } catch (settleError) {
        // Settlement error — log but don't fail the response
        console.error("x402 settlement error:", settleError);
      }
    }
  } catch (error) {
    // If this is a facilitator communication error, return 502
    if (
      error instanceof Error &&
      error.message.includes("Facilitator")
    ) {
      return c.json(
        {
          error: {
            code: "PAYMENT_FACILITATOR_ERROR",
            message: "Payment facilitator is unavailable. Try again later or use an API key.",
          },
        },
        502
      );
    }

    return c.json(
      {
        error: {
          code: "PAYMENT_ERROR",
          message: "Failed to process payment.",
        },
      },
      400
    );
  }
}

async function insertX402Payment(
  db: D1Database,
  endpoint: string,
  amountBaseUnits: number,
  txHash: string | null
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO x402_payments (endpoint, amount_base_units, tx_hash)
       VALUES (?, ?, ?)
       ON CONFLICT(tx_hash) DO NOTHING`
    )
    .bind(endpoint, amountBaseUnits, txHash)
    .run();
}

function getPrice(path: string): number {
  for (const [pattern, price] of Object.entries(ENDPOINT_PRICES)) {
    if (path.startsWith(pattern)) return price;
  }
  // Default price for unmatched endpoints (e.g. /v1/matsuri/:id)
  return 1000;
}

/** Human-readable pricing map for the /x402/info endpoint */
export function getPricingMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [path, baseUnits] of Object.entries(ENDPOINT_PRICES)) {
    const usdc = (baseUnits / 1_000_000).toFixed(4);
    map[path] = `${usdc} USDC`;
  }
  return map;
}

// ── Payment parsing & pre-checks ──

/**
 * Parse payment from header. Supports:
 * - Base64-encoded JSON (v2 PAYMENT-SIGNATURE format)
 * - Raw JSON (v1 X-PAYMENT fallback)
 */
function parsePaymentPayload(header: string): PaymentPayload | null {
  // Try base64 decode first (v2 format)
  try {
    const decoded = atob(header);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === "object" && "payload" in parsed) {
      return parsed as PaymentPayload;
    }
  } catch {
    // Not base64, try raw JSON
  }

  // Try raw JSON (v1 format)
  try {
    const parsed = JSON.parse(header);
    if (parsed && typeof parsed === "object" && "payload" in parsed) {
      return parsed as PaymentPayload;
    }
  } catch {
    // Neither base64 nor JSON
  }

  return null;
}

/**
 * Quick structural pre-checks before calling the facilitator.
 * Returns an error message if the payment is obviously invalid,
 * or null if it passes pre-checks.
 */
function preCheckPayment(
  payment: PaymentPayload,
  expectedPayTo: string,
  _requiredAmount: number,
): string | null {
  const payload = payment.payload;
  if (!payload) {
    return "Payment payload is missing.";
  }

  // If payload has payTo, verify it matches
  const payTo = payload.payTo as string | undefined;
  if (
    payTo &&
    typeof payTo === "string" &&
    payTo.toLowerCase() !== expectedPayTo.toLowerCase()
  ) {
    return "Payment payTo address does not match.";
  }

  // If payload specifies a network, verify it matches
  const network = payload.network as string | undefined;
  if (network && network !== NETWORK) {
    return `Payment network mismatch. Expected ${NETWORK}.`;
  }

  return null;
}

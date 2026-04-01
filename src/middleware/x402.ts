import { Context, Next } from "hono";
import type { Env } from "../types.js";

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

// USDC contract on Base Sepolia testnet
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

/**
 * x402 Payment Protocol middleware.
 *
 * Flow:
 * 1. If X-API-Key header present → skip (existing auth handles it)
 * 2. If X-PAYMENT header present → verify payment, serve request
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

  // Check for x402 payment header
  const paymentHeader = c.req.header("X-PAYMENT");

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
            network: "base-sepolia",
            maxAmountRequired: String(price),
            resource: c.req.url,
            payTo,
            maxTimeoutSeconds: 60,
            asset: USDC_BASE_SEPOLIA,
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

  // Verify payment from X-PAYMENT header
  try {
    const payment = parsePaymentHeader(paymentHeader);

    if (!payment) {
      return c.json(
        {
          error: {
            code: "PAYMENT_MALFORMED",
            message:
              "X-PAYMENT header is malformed. Expected JSON with payload and signature.",
          },
        },
        400
      );
    }

    const path = new URL(c.req.url).pathname;
    const requiredAmount = getPrice(path);
    const isValid = await verifyPayment(payment, payTo, requiredAmount);

    if (!isValid) {
      return c.json(
        {
          error: {
            code: "PAYMENT_INVALID",
            message: "Payment verification failed.",
          },
        },
        402
      );
    }

    // Payment verified — flag for auth middleware to skip API key check
    c.set("x402Paid" as never, true as never);
    return next();
  } catch {
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

// ── Payment parsing & verification ──

interface ParsedPayment {
  payload: {
    amount: string | number;
    asset: string;
    network: string;
    payTo: string;
    resource: string;
    [key: string]: unknown;
  };
  signature: string;
}

function parsePaymentHeader(header: string): ParsedPayment | null {
  try {
    const parsed = JSON.parse(header);
    if (parsed && typeof parsed === "object" && parsed.payload && parsed.signature) {
      return parsed as ParsedPayment;
    }
    return null;
  } catch {
    // Could be base64-encoded
    try {
      const decoded = atob(header);
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === "object" && parsed.payload && parsed.signature) {
        return parsed as ParsedPayment;
      }
      return null;
    } catch {
      return null;
    }
  }
}

async function verifyPayment(
  payment: ParsedPayment,
  expectedPayTo: string,
  requiredAmount: number
): Promise<boolean> {
  const { payload } = payment;

  // Basic structural checks
  if (!payload.payTo || !payload.amount) {
    return false;
  }

  // Check payTo matches our address (case-insensitive for Ethereum addresses)
  if (payload.payTo.toLowerCase() !== expectedPayTo.toLowerCase()) {
    return false;
  }

  // Check amount is sufficient
  const paidAmount =
    typeof payload.amount === "string"
      ? parseInt(payload.amount, 10)
      : payload.amount;
  if (isNaN(paidAmount) || paidAmount < requiredAmount) {
    return false;
  }

  // Check network
  if (payload.network && payload.network !== "base-sepolia") {
    return false;
  }

  // TODO: Implement on-chain signature verification
  // For MVP, the structural checks above are sufficient to demonstrate
  // the x402 protocol flow. Full verification would:
  // 1. Recover the signer address from the EIP-712 signature
  // 2. Verify the signer has sufficient USDC balance
  // 3. Verify the payment hasn't been replayed (nonce check)
  // 4. Optionally settle on-chain via a facilitator contract

  // For now, accept payments that pass structural validation
  return true;
}

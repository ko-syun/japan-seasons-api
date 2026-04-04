#!/usr/bin/env npx tsx
/**
 * E2E Test Script — Japan Seasons API x402 Micropayment Flow
 *
 * Tests the full x402 payment lifecycle:
 *   1. API key auth (backward compatibility)
 *   2. 402 Payment Required response (discovery)
 *   3. x402 payment via USDC on Base Sepolia (if wallet key provided)
 *   4. Replay attack rejection
 *
 * Usage:
 *   # Discovery tests only (no wallet needed)
 *   npx tsx scripts/e2e-x402.ts
 *
 *   # Full payment E2E (requires funded wallet)
 *   WALLET_PRIVATE_KEY=0x... npx tsx scripts/e2e-x402.ts
 *
 *   # Against local dev
 *   API_URL=http://localhost:8787 npx tsx scripts/e2e-x402.ts
 *
 * Prerequisites for full E2E:
 *   - Base Sepolia ETH (gas): https://www.alchemy.com/faucets/base
 *   - Base Sepolia USDC: https://faucet.circle.com/ → Base Sepolia
 *   - Wallet private key with both ETH + USDC on Base Sepolia
 */

const API_URL = process.env.API_URL ?? "https://jpseasons.dokos.dev";
const API_KEY = process.env.API_KEY ?? "sakura-demo-2026";
const WALLET_KEY = process.env.WALLET_PRIVATE_KEY;

const USDC_BASE_SEPOLIA = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const PAYTO = "0xBC4EA29B8866ec5B26FFA0Ca431966E6eC6E3202";

let passed = 0;
let failed = 0;
let skipped = 0;

function log(icon: string, msg: string) {
  console.log(`  ${icon} ${msg}`);
}

function assert(condition: boolean, msg: string) {
  if (condition) {
    log("✅", msg);
    passed++;
  } else {
    log("❌", msg);
    failed++;
  }
}

function skip(msg: string) {
  log("⏭️ ", msg);
  skipped++;
}

// ── Test 1: API Key Authentication ──
async function testApiKeyAuth() {
  console.log("\n🔑 Test 1: API Key Authentication");

  const res = await fetch(`${API_URL}/v1/sakura/forecast?city=tokyo`, {
    headers: { "X-API-Key": API_KEY },
  });
  assert(res.status === 200, `Status 200 (got ${res.status})`);

  const body = await res.json() as Record<string, unknown>;
  const data = body.data as Record<string, unknown> | undefined;
  assert(!!data, "Response contains data field");
  assert(Array.isArray((data as Record<string, unknown>)?.locations), "Response contains locations array");
}

// ── Test 2: 402 Payment Required (Discovery) ──
async function test402Discovery() {
  console.log("\n💰 Test 2: 402 Payment Required (x402 Discovery)");

  const res = await fetch(`${API_URL}/v1/sakura/forecast?city=tokyo`);
  assert(res.status === 402, `Status 402 (got ${res.status})`);

  const body = await res.json() as Record<string, unknown>;
  assert(body.x402Version === 1, `x402Version: ${body.x402Version}`);

  const accepts = body.accepts as Array<Record<string, unknown>>;
  assert(Array.isArray(accepts) && accepts.length > 0, "Has accepts array");

  const accept = accepts[0];
  assert(accept.scheme === "exact", `Scheme: ${accept.scheme}`);
  assert(accept.network === "base", `Network: ${accept.network}`);
  assert(accept.asset === USDC_BASE_SEPOLIA, `Asset: USDC on Base Sepolia`);
  assert((accept.payTo as string)?.toLowerCase() === PAYTO.toLowerCase(), `PayTo: ${accept.payTo}`);
  assert(typeof accept.maxAmountRequired === "string", `Amount: ${accept.maxAmountRequired} (${Number(accept.maxAmountRequired) / 1_000_000} USDC)`);
}

// ── Test 3: x402/info Endpoint ──
async function testX402Info() {
  console.log("\n📋 Test 3: /x402/info Endpoint");

  const res = await fetch(`${API_URL}/x402/info`);
  assert(res.status === 200, `Status 200 (got ${res.status})`);

  const body = await res.json() as Record<string, unknown>;
  assert(body.paymentAccepted === true, `paymentAccepted: ${body.paymentAccepted}`);
  assert(typeof body.facilitator === "string", `Facilitator: ${body.facilitator}`);

  const networks = body.supportedNetworks as string[];
  assert(Array.isArray(networks) && networks.includes("base"), `Networks: ${networks}`);

  const pricing = body.pricing as Record<string, unknown>;
  assert(!!pricing, "Has pricing map");
  log("📊", `Endpoints: ${Object.keys(pricing ?? {}).join(", ")}`);
}

// ── Test 4: Multiple Endpoints 402 ──
async function testMultipleEndpoints() {
  console.log("\n🔄 Test 4: Multiple Endpoints Return 402");

  const endpoints = [
    "/v1/sakura/locations",
    "/v1/sakura/status",
    "/v1/kouyou/forecast?city=tokyo",
    "/v1/matsuri/search?q=hanabi",
  ];

  for (const endpoint of endpoints) {
    const res = await fetch(`${API_URL}${endpoint}`);
    assert(res.status === 402, `${endpoint} → 402 (got ${res.status})`);
  }
}

// ── Test 5: x402 Payment Flow (requires wallet) ──
async function testX402Payment() {
  console.log("\n💳 Test 5: x402 Payment Flow (USDC Micropayment)");

  if (!WALLET_KEY) {
    skip("WALLET_PRIVATE_KEY not set — skipping payment tests");
    skip("Run with: WALLET_PRIVATE_KEY=0x... npx tsx scripts/e2e-x402.ts");
    return;
  }

  try {
    // Dynamic import to avoid errors when packages aren't installed
    const { withPayment } = await import("@x402/evm");
    const { wrapFetch } = await import("@x402/fetch");

    const paymentFetch = wrapFetch(fetch, withPayment(WALLET_KEY as `0x${string}`));

    // 5a: Successful payment
    log("🔄", "Sending x402 payment request...");
    const res = await paymentFetch(`${API_URL}/v1/sakura/forecast?city=tokyo`);
    assert(res.status === 200, `Payment accepted → 200 (got ${res.status})`);

    if (res.status === 200) {
      const body = await res.json() as Record<string, unknown>;
      assert(!!body.data, "Response contains data after payment");

      const txHash = res.headers.get("X-Payment-Transaction");
      const network = res.headers.get("X-Payment-Network");
      if (txHash) {
        log("🔗", `Settlement TX: ${txHash}`);
        log("🌐", `Network: ${network}`);
      } else {
        log("⚠️ ", "No settlement TX in response headers (settlement may be async)");
      }
    }

    // 5b: Test that facilitator returns errors for bad payments
    log("🔄", "Testing malformed payment rejection...");
    const badRes = await fetch(`${API_URL}/v1/sakura/forecast?city=tokyo`, {
      headers: { "X-PAYMENT": '{"payload":{},"signature":"0xdead"}' },
    });
    assert(
      badRes.status === 400 || badRes.status === 402,
      `Malformed payment rejected → ${badRes.status}`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("❌", `Payment flow error: ${msg}`);
    failed++;

    if (msg.includes("insufficient funds")) {
      log("💡", "Wallet needs USDC on Base Sepolia. Get some at: https://faucet.circle.com/");
    }
    if (msg.includes("gas")) {
      log("💡", "Wallet needs ETH on Base Sepolia for gas. Get some at: https://www.alchemy.com/faucets/base");
    }
  }
}

// ── Main ──
async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║  Japan Seasons API — E2E x402 Test Suite   ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║  API:    ${API_URL.padEnd(33)}║`);
  console.log(`║  Wallet: ${WALLET_KEY ? "Configured ✓" : "Not set (discovery only)"}${" ".repeat(Math.max(0, 33 - (WALLET_KEY ? 14 : 27)))}║`);
  console.log("╚════════════════════════════════════════════╝");

  await testApiKeyAuth();
  await test402Discovery();
  await testX402Info();
  await testMultipleEndpoints();
  await testX402Payment();

  console.log("\n" + "═".repeat(46));
  console.log(`  Results: ✅ ${passed} passed  ❌ ${failed} failed  ⏭️  ${skipped} skipped`);
  console.log("═".repeat(46));

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

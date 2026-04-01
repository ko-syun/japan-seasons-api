# Phase 6 Specification — Usage-Based Pricing + x402 Agent Payments

**Date:** 2026-04-01
**Status:** In Progress

---

## Phase A: Stripe Metered Billing (Pay-as-you-go)

### New Tier
| Tier | Price | Rate Limit | Billing |
|------|-------|------------|---------|
| Free | $0 | 100 req/day | - |
| Pro | $29/mo | 10K req/day | Fixed monthly |
| Pay-as-you-go | $0.001/req | No daily limit | Metered monthly |

### Implementation

1. **Stripe Setup:**
   - Create metered price: `usage_type: metered`, $0.001/unit
   - Subscription with metered billing item

2. **Code Changes:**
   - `src/middleware/rateLimit.ts`: Add monthly counter for PAYG tier (no daily cap)
   - `src/dashboard/stripe.ts`: Add `reportUsage()` function
   - `src/cron/billing.ts`: Monthly cron to report usage to Stripe
   - `src/routes/dashboard.ts`: Add PAYG checkout flow

3. **DB Changes:**
   - `user_api_keys`: Add `stripe_subscription_item_id` column
   - New table `usage_records`: Daily usage aggregation per key

### Cron
- Daily at 00:05 UTC: Aggregate previous day's usage from KV → D1
- Monthly at 00:10 UTC on 1st: Report accumulated usage to Stripe

---

## Phase B: x402 Protocol (Crypto Micropayments)

### Concept
HTTP 402 status code based payment. Each API request can be paid with USDC — no API key needed.

### Flow
```
1. Agent sends GET /v1/sakura/forecast?city=tokyo
   (no API key, no auth)

2. Server returns HTTP 402 with payment requirements:
   {
     "x402Version": 1,
     "accepts": [{
       "scheme": "exact",
       "network": "base",
       "maxAmountRequired": "1000",  // 0.001 USDC (6 decimals)
       "resource": "https://jpseasons.dokos.dev/v1/sakura/forecast",
       "payTo": "0x...",
       "maxTimeoutSeconds": 60
     }]
   }

3. Agent signs USDC payment and includes in X-PAYMENT header

4. Server verifies payment on-chain → returns data
```

### Implementation

1. **Install:** `npm install x402-hono` (or build custom middleware)

2. **New middleware:** `src/middleware/x402.ts`
   - Check for X-PAYMENT header
   - If present: verify payment, serve response
   - If absent and no API key: return 402 with payment requirements
   - If API key present: use existing auth flow (backward compatible)

3. **Pricing per endpoint:**
   | Endpoint | USDC/req |
   |----------|----------|
   | /v1/sakura/locations | 0.0005 |
   | /v1/sakura/status | 0.001 |
   | /v1/sakura/forecast | 0.001 |
   | /v1/sakura/historical | 0.002 |
   | /v1/sakura/recommend | 0.002 |
   | /v1/kouyou/* | same as sakura |
   | /v1/matsuri/* | 0.001 |

4. **Wallet Setup:**
   - Create a dedicated receiving wallet (Base network)
   - Store address in wrangler secret: `X402_PAYTO_ADDRESS`

5. **Backward Compatibility:**
   - Existing API key auth continues to work unchanged
   - x402 is an alternative payment method, not a replacement
   - Free/Pro/PAYG tiers unaffected

### Network
- **Primary:** Base (Coinbase L2) — lowest fees, best x402 support
- **Future:** Solana, Polygon

---

## Priority
1. Phase A first (Stripe PAYG) — safe, proven
2. Phase B immediately after (x402) — differentiation play

## Marketing Angle
"The world's first x402-enabled seasonal data API"
→ This is a genuine first-mover claim. No other seasonal/weather/travel API accepts crypto micropayments via x402.

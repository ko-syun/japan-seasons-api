<div align="center">

# 🌸 Japan Seasons API 🍁

**The definitive API for Japanese cherry blossoms, autumn foliage, and festivals.**

57 stations · 73 years of data · 200+ festivals · AI-ready

[![License](https://img.shields.io/badge/license-Proprietary-blue)](https://jpseasons.dokos.dev)
[![Cloudflare Workers](https://img.shields.io/badge/runtime-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![x402](https://img.shields.io/badge/x402-micropayments-6E42C1)](https://x402.org)
[![MCP](https://img.shields.io/badge/MCP-compatible-00A67E)](https://modelcontextprotocol.io)

[Website](https://jpseasons.dokos.dev) · [Dashboard](https://jpseasons.dokos.dev/dashboard) · [API Status](https://jpseasons.dokos.dev/health)

</div>

---

## What is it?

Japan Seasons API provides structured, real-time data from the Japan Meteorological Agency (気象庁) — cherry blossom forecasts, autumn foliage tracking, and curated festival listings — through a fast, developer-friendly REST API.

- 🌸 **Sakura** — 57 JMA observation stations, bloom data from 1953 to present
- 🍁 **Kouyou** — 53 autumn foliage stations with forecasts and historical records
- 🏮 **Matsuri** — 200+ curated Japanese festivals, searchable by region, month, and category
- 🤖 **MCP Server** — 10 tools for AI agent integration (Claude, etc.)
- 💳 **x402 Micropayments** — Pay-per-request with USDC, no API key needed

---

## Quick Start

```bash
# Get a free API key → https://jpseasons.dokos.dev/dashboard

# Cherry blossom forecast for Tokyo
curl -H "X-API-Key: YOUR_KEY" \
  "https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo"

# Autumn foliage status in Kyoto
curl -H "X-API-Key: YOUR_KEY" \
  "https://jpseasons.dokos.dev/v1/kouyou/status?city=kyoto"

# Search festivals in Kansai
curl -H "X-API-Key: YOUR_KEY" \
  "https://jpseasons.dokos.dev/v1/matsuri/search?region=kansai"

# Travel timing recommendation
curl -H "X-API-Key: YOUR_KEY" \
  "https://jpseasons.dokos.dev/v1/sakura/recommend?city=kyoto&dates=2026-03-25/2026-04-05"
```

---

## Authentication

All API endpoints require authentication via one of:

| Method | Header | Example |
|--------|--------|---------|
| API Key | `X-API-Key` | `X-API-Key: your-key-here` |
| Bearer Token | `Authorization` | `Authorization: Bearer your-key-here` |
| x402 Payment | `X-PAYMENT` | Signed USDC payment (see below) |

Get your free API key at the [Dashboard](https://jpseasons.dokos.dev/dashboard).

---

## x402 Micropayments

> **First seasonal data API with x402 support.**

Japan Seasons API implements the [HTTP 402 Payment Required](https://www.x402.org) protocol — enabling machine-to-machine payments without API keys, subscriptions, or sign-ups.

### How it works

1. **Request without auth** → API returns `402 Payment Required` with pricing details
2. **Client signs a USDC payment** → Sends it in the `X-PAYMENT` header
3. **Facilitator verifies & settles** → API serves the response

No API key needed. No account. Just pay per request.

### Network & Asset

| | Testnet (current) | Mainnet (planned) |
|---|---|---|
| **Network** | Base Sepolia | Base |
| **Asset** | USDC | USDC |
| **Facilitator** | [x402.org/facilitator](https://x402.org/facilitator) | TBA |

### Pricing per request

| Endpoint | Price (USDC) |
|----------|-------------|
| `/v1/*/locations` | $0.0005 |
| `/v1/*/status`, `/v1/*/forecast` | $0.001 |
| `/v1/*/historical`, `/v1/*/recommend` | $0.002 |
| `/v1/matsuri/search`, `/v1/matsuri/upcoming` | $0.001 |

### Code example

```typescript
import { fetchWithPayment } from "@x402/fetch";

const response = await fetchWithPayment(
  "https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo",
  { method: "GET" },
  {
    walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
  }
);

const data = await response.json();
console.log(data);
```

### Discovery

```bash
# Check x402 configuration and pricing
curl https://jpseasons.dokos.dev/x402/info
```

📖 Learn more: [x402.org](https://www.x402.org)

---

## MCP Integration

Connect AI agents via [Model Context Protocol](https://modelcontextprotocol.io). No setup required — just point your client at the MCP endpoint.

**Endpoint:** `https://jpseasons.dokos.dev/mcp`

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "japan-seasons": {
      "url": "https://jpseasons.dokos.dev/mcp"
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add --transport http japan-seasons https://jpseasons.dokos.dev/mcp
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `get_sakura_status` | Current cherry blossom status |
| `get_sakura_forecast` | Bloom date forecast |
| `get_sakura_historical` | Historical records + statistics |
| `get_sakura_locations` | All observation stations |
| `recommend_sakura_timing` | Best travel dates for cherry blossoms |
| `get_kouyou_status` | Autumn foliage status |
| `get_kouyou_forecast` | Foliage forecast |
| `get_kouyou_historical` | Historical foliage data |
| `get_kouyou_locations` | Foliage station list |
| `recommend_kouyou_timing` | Best travel dates for autumn leaves |

---

## API Reference

### Sakura (Cherry Blossom) 🌸

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/sakura/status` | Current bloom status across 57 stations |
| `GET` | `/v1/sakura/forecast` | Bloom date forecast (30-year historical average) |
| `GET` | `/v1/sakura/historical` | Historical records with statistics |
| `GET` | `/v1/sakura/locations` | All observation stations |
| `GET` | `/v1/sakura/recommend` | Travel timing recommendation |

### Kouyou (Autumn Foliage) 🍁

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/kouyou/status` | Current foliage status across 53 stations |
| `GET` | `/v1/kouyou/forecast` | Foliage color forecast |
| `GET` | `/v1/kouyou/historical` | Historical foliage records |
| `GET` | `/v1/kouyou/locations` | All foliage observation stations |
| `GET` | `/v1/kouyou/recommend` | Travel timing recommendation |

### Matsuri (Festivals) 🏮

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/matsuri/search` | Search by region, month, category |
| `GET` | `/v1/matsuri/upcoming` | Upcoming festivals (next N days) |
| `GET` | `/v1/matsuri/:id` | Festival detail by ID |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/x402/info` | x402 payment configuration & pricing |
| `GET` | `/mcp` | MCP server endpoint |
| `GET` | `/llms.txt` | LLM discovery file |

---

## Pricing

| | Free | Pro | Pay-as-you-go | x402 |
|---|---|---|---|---|
| **Price** | $0/mo | $29/mo | Usage-based | Per-request |
| **Requests** | 100/day | 10,000/day | Unlimited | Unlimited |
| **Data** | Current year | Full historical | Full historical | Full historical |
| **Auth** | API Key | API Key | API Key | USDC payment |
| **SLA** | — | — | ✓ | — |
| **Sign-up** | Required | Required | Required | **Not required** |

[Get started →](https://jpseasons.dokos.dev/dashboard)

---

## Running E2E Tests

The `scripts/e2e-x402.ts` script tests the full x402 payment lifecycle:

```bash
# Discovery tests only (no wallet needed)
npx tsx scripts/e2e-x402.ts

# Full payment E2E (requires funded Base Sepolia wallet)
WALLET_PRIVATE_KEY=0x... npx tsx scripts/e2e-x402.ts

# Against local dev server
API_URL=http://localhost:8787 npx tsx scripts/e2e-x402.ts
```

**Prerequisites for full E2E:**
- Base Sepolia ETH for gas → [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia)
- Base Sepolia USDC → [Circle Faucet](https://faucet.circle.com/)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | [Cloudflare Workers](https://workers.cloudflare.com) |
| **Framework** | [Hono](https://hono.dev) v4 |
| **Database** | Cloudflare D1 (SQLite at the edge) |
| **Cache** | Cloudflare KV |
| **Payments** | Stripe + [x402](https://x402.org) (USDC) |
| **AI Integration** | MCP Server (10 tools) |
| **Language** | TypeScript (strict mode) |
| **Tests** | Vitest + Miniflare |

## Data Source

[Japan Meteorological Agency (気象庁)](https://www.jma.go.jp/) — public observation data since 1953.

---

## Development

```bash
npm install
npx vitest run        # run tests
npx tsc --noEmit      # type check
npx wrangler dev      # local dev server
npx wrangler deploy   # deploy to production
```

---

## License

Proprietary — [KoS LLC](https://jpseasons.dokos.dev)

---

## Links

- 🌐 **Website:** [jpseasons.dokos.dev](https://jpseasons.dokos.dev)
- 📊 **Dashboard:** [jpseasons.dokos.dev/dashboard](https://jpseasons.dokos.dev/dashboard)
- 🤖 **MCP Endpoint:** [jpseasons.dokos.dev/mcp](https://jpseasons.dokos.dev/mcp)
- 💳 **x402 Info:** [jpseasons.dokos.dev/x402/info](https://jpseasons.dokos.dev/x402/info)
- 📖 **LLM Discovery:** [jpseasons.dokos.dev/llms.txt](https://jpseasons.dokos.dev/llms.txt)
- 🔧 **API Health:** [jpseasons.dokos.dev/health](https://jpseasons.dokos.dev/health)

---

<div align="center">

Built with 🌸 by [KoS LLC](https://jpseasons.dokos.dev) in Japan

</div>

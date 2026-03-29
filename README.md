# Japan Seasons API 🌸🍁🏮

REST API for Japanese seasonal data — cherry blossom forecasts, autumn foliage tracking, and festival search.

**Live:** https://jpseasons.dokos.dev
**Dashboard:** https://jpseasons.dokos.dev/dashboard

## Features

- 🌸 **Sakura** — 57 JMA stations, 73 years of bloom data (1953-present)
- 🍁 **Kouyou** — 53 autumn foliage stations
- 🏮 **Matsuri** — 50+ curated Japanese festivals
- 🤖 **MCP Server** — 10 tools for AI agent integration
- 💳 **Self-service Dashboard** — API key management + Stripe billing

## Quick Start

```bash
# Get a free API key
# → https://jpseasons.dokos.dev/dashboard

# Cherry blossom forecast for Tokyo
curl -H "X-API-Key: YOUR_KEY" "https://jpseasons.dokos.dev/v1/sakura/forecast?city=tokyo"

# Best time to visit Kyoto for cherry blossoms
curl -H "X-API-Key: YOUR_KEY" "https://jpseasons.dokos.dev/v1/sakura/recommend?city=kyoto&dates=2026-03-25/2026-04-05"

# Search festivals in Kansai region
curl -H "X-API-Key: YOUR_KEY" "https://jpseasons.dokos.dev/v1/matsuri/search?region=kansai"
```

## API Endpoints

### Sakura (Cherry Blossom)

| Endpoint | Description |
|---|---|
| `GET /v1/sakura/status` | Current bloom status across 57 stations |
| `GET /v1/sakura/forecast` | Bloom date forecast (30-year historical average) |
| `GET /v1/sakura/historical?city=tokyo` | Historical records with statistics |
| `GET /v1/sakura/locations` | All observation stations |
| `GET /v1/sakura/recommend?city=&dates=` | Travel timing recommendation |

### Kouyou (Autumn Foliage)

Same pattern under `/v1/kouyou/` — `status`, `forecast`, `historical`, `locations`, `recommend`

### Matsuri (Festivals)

| Endpoint | Description |
|---|---|
| `GET /v1/matsuri/search` | Search by region, month, category |
| `GET /v1/matsuri/upcoming` | Upcoming festivals (next N days) |
| `GET /v1/matsuri/:id` | Festival detail |

## MCP Server (AI Agent Integration)

Connect AI agents via [Model Context Protocol](https://modelcontextprotocol.io):

**Endpoint:** `https://jpseasons.dokos.dev/mcp`

### Claude Desktop config

```json
{
  "mcpServers": {
    "japan-seasons": {
      "url": "https://jpseasons.dokos.dev/mcp"
    }
  }
}
```

### Available Tools

| Tool | Description |
|---|---|
| `get_sakura_status` | Current cherry blossom status |
| `get_sakura_forecast` | Bloom forecast |
| `get_sakura_historical` | Historical data |
| `get_sakura_locations` | Station list |
| `recommend_sakura_timing` | Travel recommendation |
| `get_kouyou_status` | Autumn foliage status |
| `get_kouyou_forecast` | Foliage forecast |
| `get_kouyou_historical` | Historical data |
| `get_kouyou_locations` | Station list |
| `recommend_kouyou_timing` | Travel recommendation |

## Pricing

| Free | Pro ($29/mo) | Enterprise |
|------|-------------|------------|
| 100 req/day | 10K req/day | 100K req/day |
| Current year | Historical data | SLA |

Sign up: https://jpseasons.dokos.dev/dashboard

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Framework:** Hono v4
- **Database:** Cloudflare D1 (SQLite)
- **Cache:** Cloudflare KV
- **Payments:** Stripe
- **Language:** TypeScript (strict)
- **Tests:** Vitest + Miniflare (66 tests)

## Data Source

Japan Meteorological Agency (気象庁) — public observation data since 1953.

## Development

```bash
npm install
npx vitest run        # 66 tests
npx tsc --noEmit      # type check
npx wrangler dev      # local dev server
npx wrangler deploy   # deploy to production
```

## License

Proprietary — KoS LLC

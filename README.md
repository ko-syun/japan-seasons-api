# Japan Seasons API 🌸🍁

**日本の季節情報を世界のAIエージェントに届ける — the world's first English API for Japan's seasonal phenomena.**

## What is this?

A structured, English-language API providing real-time and historical data on Japan's iconic seasonal events:

- **Cherry Blossom (Sakura) Front** — bloom forecasts, actual dates, viewing spots
- **Autumn Foliage (Kouyou) Front** — maple color-change tracking
- **Festivals & Events (Matsuri)** — structured data for Japan's thousands of festivals

No one else provides this data as a machine-readable API in English. Zero competitors.

## Why?

AI agents are the new customers. When a user asks Claude "When should I visit Kyoto for cherry blossoms?", there's no API for the agent to call. We fix that.

This is a **toA (to-Agent) business** — APIs designed for AI consumption first, with MCP (Model Context Protocol) server support for direct Claude/GPT integration.

## Architecture

- **Runtime:** Cloudflare Workers (edge, globally distributed)
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Cache:** Cloudflare KV (hot data)
- **Data Pipeline:** Scheduled Workers (cron triggers) scraping JMA + municipal open data
- **MCP Server:** Streamable HTTP transport, deployable as Worker

See [docs/DESIGN.md](docs/DESIGN.md) for full architecture.

## Project Status

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Sakura (Cherry Blossom) API | 📐 Design |
| 2 | Kouyou (Autumn Foliage) API | 📋 Planned |
| 3 | Matsuri (Festival) API | 📋 Planned |
| 4 | MCP Server | 📋 Planned |

## Quick Start (Phase 1)

```bash
# Clone and install
git clone https://github.com/kos-llc/japan-seasons-api.git
cd japan-seasons-api
npm install

# Local dev
npx wrangler dev

# Deploy
npx wrangler deploy
```

## API Examples

```bash
# Current sakura forecast
curl https://api.japanseasons.com/v1/sakura/forecast

# Specific location
curl https://api.japanseasons.com/v1/sakura/forecast?city=tokyo

# Historical data
curl https://api.japanseasons.com/v1/sakura/historical?city=kyoto&year=2025

# Best timing recommendation
curl https://api.japanseasons.com/v1/sakura/recommend?month=4&region=kansai
```

## Revenue Model

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 100 req/day, current year only |
| Pro | $29/mo | 10K req/day, historical data, webhooks |
| Enterprise | Custom | Unlimited, SLA, dedicated support |

## Data Sources

All data sourced from Japanese government open data (JMA Biological Season Observations) under public data license. See [docs/DATA-SOURCES.md](docs/DATA-SOURCES.md).

## License

Proprietary — © 2026 KoS LLC (合同会社KoS)

## Docs

- [Architecture Design](docs/DESIGN.md)
- [Phase 1 Spec (Sakura API)](docs/PHASE1-SPEC.md)
- [Data Sources & Legality](docs/DATA-SOURCES.md)

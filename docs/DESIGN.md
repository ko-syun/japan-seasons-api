# Architecture Design — Japan Seasons API

**Author:** Rin (CTO, KoS LLC)
**Date:** 2026-03-29
**Status:** Draft

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge Network                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  API Worker   │  │  MCP Worker  │  │  Data Pipeline Worker  │ │
│  │  (REST API)   │  │  (MCP SSE)   │  │  (Cron Triggers)       │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘ │
│         │                 │                      │               │
│         ▼                 ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Cloudflare D1 (SQLite)                 │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │   │
│  │  │ sakura  │ │  kouyou  │ │ matsuri  │ │  metadata   │  │   │
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────┐                                   │
│  │    Cloudflare KV Cache   │  ← Hot forecast data, 1h TTL     │
│  └──────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Cron (daily during season)
                              ▼
                 ┌──────────────────────┐
                 │   External Sources   │
                 │  ┌────────────────┐  │
                 │  │  JMA Website   │  │  ← 気象庁 生物季節観測
                 │  │  (HTML scrape) │  │
                 │  └────────────────┘  │
                 │  ┌────────────────┐  │
                 │  │  JMA XML Feed  │  │  ← 防災情報XML
                 │  └────────────────┘  │
                 │  ┌────────────────┐  │
                 │  │  Municipal OD  │  │  ← 自治体オープンデータ
                 │  └────────────────┘  │
                 └──────────────────────┘
```

## 2. Technology Stack

### Why Cloudflare Workers + D1

| Requirement | Solution | Rationale |
|-------------|----------|-----------|
| Global low-latency | Workers (edge) | <50ms from anywhere |
| Structured queries | D1 (SQLite) | SQL for geo/time queries, no cold start |
| Hot cache | KV | Sub-ms reads for current forecasts |
| Scheduled ingestion | Cron Triggers | Built-in, no external scheduler |
| Cost at scale | Workers pricing | Free tier generous; $5/mo for 10M req |
| MCP hosting | Workers | Streamable HTTP, no WebSocket needed |

### Alternatives Considered

- **Hono on Workers** — Yes, using Hono as the framework. Lightweight, Workers-native, TypeScript.
- **Supabase** — Considered but rejected. D1 is cheaper, edge-native, and we don't need real-time subscriptions.
- **Vercel + Postgres** — No advantage over Workers for this use case. Edge functions have cold starts.
- **Self-hosted** — Unnecessary operational burden for a read-heavy API.

### Stack Summary

| Layer | Choice |
|-------|--------|
| Framework | Hono (v4+) |
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 |
| Cache | Cloudflare KV |
| Language | TypeScript (strict) |
| Validation | Zod |
| MCP | @modelcontextprotocol/sdk |
| Testing | Vitest + Miniflare |
| CI/CD | GitHub Actions → Wrangler deploy |
| Monitoring | Cloudflare Analytics + Workers Logpush |

## 3. Data Architecture

### 3.1 Core Entities

```sql
-- Observation locations (JMA weather stations)
CREATE TABLE locations (
  id TEXT PRIMARY KEY,          -- e.g., "tokyo", "osaka"
  name_en TEXT NOT NULL,        -- "Tokyo"
  name_ja TEXT NOT NULL,        -- "東京"
  prefecture_en TEXT NOT NULL,  -- "Tokyo"
  prefecture_ja TEXT NOT NULL,  -- "東京都"
  region TEXT NOT NULL,         -- "kanto", "kansai", etc.
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  jma_station_id TEXT           -- JMA internal ID
);

-- Sakura observations (actual + forecast)
CREATE TABLE sakura_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id TEXT NOT NULL REFERENCES locations(id),
  year INTEGER NOT NULL,
  bloom_date TEXT,              -- ISO 8601 date (actual)
  full_bloom_date TEXT,         -- ISO 8601 date (actual)
  bloom_forecast TEXT,          -- ISO 8601 date (forecast)
  full_bloom_forecast TEXT,     -- ISO 8601 date (forecast)
  bloom_status TEXT,            -- "not_yet" | "budding" | "blooming" | "full_bloom" | "falling" | "ended"
  normal_bloom_date TEXT,       -- Historical average
  normal_full_bloom_date TEXT,
  diff_from_normal INTEGER,    -- Days from normal (negative = early)
  tree_species TEXT DEFAULT 'somei_yoshino',
  source TEXT NOT NULL,         -- "jma" | "jwa" | "weathernews"
  updated_at TEXT NOT NULL,
  UNIQUE(location_id, year, source)
);

-- Kouyou observations (Phase 2)
CREATE TABLE kouyou_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id TEXT NOT NULL REFERENCES locations(id),
  year INTEGER NOT NULL,
  color_change_date TEXT,       -- 紅葉日
  fallen_leaves_date TEXT,      -- 落葉日
  color_change_forecast TEXT,
  status TEXT,                  -- "green" | "starting" | "peak" | "falling" | "ended"
  tree_species TEXT DEFAULT 'kaede',
  normal_color_change_date TEXT,
  diff_from_normal INTEGER,
  source TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(location_id, year, source)
);

-- Matsuri/Events (Phase 3)
CREATE TABLE matsuri (
  id TEXT PRIMARY KEY,          -- slug: "gion-matsuri-2026"
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description_en TEXT,
  location_id TEXT REFERENCES locations(id),
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  venue TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  category TEXT,                -- "traditional" | "fireworks" | "dance" | "food" | "religious"
  scale TEXT,                   -- "local" | "regional" | "national" | "international"
  estimated_visitors INTEGER,
  latitude REAL,
  longitude REAL,
  website_url TEXT,
  source TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_sakura_location_year ON sakura_observations(location_id, year);
CREATE INDEX idx_sakura_year_status ON sakura_observations(year, bloom_status);
CREATE INDEX idx_kouyou_location_year ON kouyou_observations(location_id, year);
CREATE INDEX idx_matsuri_dates ON matsuri(start_date, end_date);
CREATE INDEX idx_matsuri_prefecture ON matsuri(prefecture);
```

### 3.2 Data Flow

```
JMA HTML Page ──scrape──→ Parse HTML table ──transform──→ D1 INSERT/UPDATE
     │                                                         │
     │  (daily during season, 09:00 JST)                      │
     ▼                                                         ▼
JMA XML Feed ──parse───→ Extract season obs ──transform──→ KV cache update
                                                               │
                                                               ▼
                                                    API serves from KV (hot)
                                                    or D1 (historical queries)
```

### 3.3 Caching Strategy

| Data Type | Cache | TTL | Rationale |
|-----------|-------|-----|-----------|
| Current forecast | KV | 1 hour | Forecasts update 1-2x/day |
| Current status | KV | 6 hours | Status changes infrequently |
| Historical data | D1 (no cache) | — | Rarely changes, D1 is fast enough |
| Location list | KV | 24 hours | Static data |

## 4. API Design

### 4.1 Base URL

```
Production: https://api.japanseasons.com
Staging:    https://staging.api.japanseasons.com
```

### 4.2 Authentication

- **Free tier:** API key in header (`X-API-Key`) or query param (`?api_key=`)
- **Pro/Enterprise:** Same, with higher rate limits
- API keys generated via dashboard (Phase 2) or manual provisioning (Phase 1)
- Rate limiting via Cloudflare Workers KV counter

### 4.3 Common Response Format

```json
{
  "data": { ... },
  "meta": {
    "source": "jma",
    "updated_at": "2026-03-29T09:00:00+09:00",
    "attribution": "Data sourced from Japan Meteorological Agency (気象庁)"
  },
  "pagination": {
    "total": 58,
    "page": 1,
    "per_page": 20,
    "pages": 3
  }
}
```

### 4.4 Error Format

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Free tier limit of 100 requests/day exceeded. Upgrade to Pro for 10K req/day.",
    "upgrade_url": "https://japanseasons.com/pricing"
  }
}
```

### 4.5 Versioning

URL-based: `/v1/`. Breaking changes get `/v2/`. Non-breaking additions (new fields) are added to existing version.

## 5. MCP Server Design (Phase 4)

### 5.1 Transport

**Streamable HTTP** — deployed as a Cloudflare Worker at `/mcp`. No WebSocket required; simpler deployment and scaling.

### 5.2 Tools

```typescript
// MCP tool definitions
const tools = [
  {
    name: "get_sakura_forecast",
    description: "Get cherry blossom bloom forecast for Japanese cities. Returns expected bloom and full-bloom dates.",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name (e.g., 'tokyo', 'kyoto', 'osaka')" },
        region: { type: "string", description: "Region filter (e.g., 'kanto', 'kansai', 'tohoku')" }
      }
    }
  },
  {
    name: "get_sakura_status",
    description: "Get current cherry blossom status across Japan. Shows which cities are blooming now.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["blooming", "full_bloom", "all"] }
      }
    }
  },
  {
    name: "recommend_sakura_timing",
    description: "Recommend the best time to visit a Japanese city for cherry blossoms based on historical and forecast data.",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string" },
        travel_dates: { type: "string", description: "Planned travel period, e.g., 'March 25 - April 5'" }
      },
      required: ["city"]
    }
  },
  {
    name: "get_kouyou_forecast",
    description: "Get autumn foliage forecast for Japanese cities."
    // Similar structure
  },
  {
    name: "search_matsuri",
    description: "Search for Japanese festivals and events by date, region, or category.",
    inputSchema: {
      type: "object",
      properties: {
        month: { type: "integer", minimum: 1, maximum: 12 },
        region: { type: "string" },
        category: { type: "string", enum: ["traditional", "fireworks", "dance", "food", "religious"] }
      }
    }
  }
];
```

### 5.3 Resources

```typescript
const resources = [
  {
    uri: "seasons://sakura/overview",
    name: "Cherry Blossom Season Overview",
    description: "Current season summary with all locations"
  },
  {
    uri: "seasons://kouyou/overview",
    name: "Autumn Foliage Season Overview"
  },
  {
    uri: "seasons://matsuri/upcoming",
    name: "Upcoming Festivals",
    description: "Festivals in the next 30 days"
  }
];
```

## 6. Revenue Model

### 6.1 Pricing Tiers

| Tier | Monthly | Rate Limit | Features |
|------|---------|------------|----------|
| **Free** | $0 | 100 req/day | Current year, basic fields |
| **Pro** | $29 | 10K req/day | Historical data, webhooks, bulk export |
| **Enterprise** | Custom | Unlimited | SLA, dedicated support, custom data |

### 6.2 Revenue Projections (Conservative)

- **Year 1:** Focus on Free tier adoption. Target 500 free users, 20 Pro ($6,960 ARR)
- **Year 2:** MCP adoption wave. Target 2K free, 100 Pro, 5 Enterprise ($50K+ ARR)
- **Year 3:** Expand to full seasonal data. Target $150K+ ARR

### 6.3 Payment

Stripe Billing with usage-based metering. API key provisioned on subscription.

### 6.4 Additional Revenue Streams

- **MCP marketplace listing fees** (if platforms charge)
- **Premium data** (real-time webcam status, crowd levels) — Phase 3+
- **Consulting/Integration** for travel tech companies

## 7. Project Structure

```
japan-seasons-api/
├── README.md
├── docs/
│   ├── DESIGN.md              # This file
│   ├── PHASE1-SPEC.md         # Phase 1 detailed spec
│   └── DATA-SOURCES.md        # Data sources & legality
├── src/
│   ├── index.ts               # Hono app entry point
│   ├── routes/
│   │   ├── sakura.ts          # /v1/sakura/* routes
│   │   ├── kouyou.ts          # /v1/kouyou/* routes (Phase 2)
│   │   ├── matsuri.ts         # /v1/matsuri/* routes (Phase 3)
│   │   └── mcp.ts             # /mcp endpoint (Phase 4)
│   ├── services/
│   │   ├── sakura-service.ts  # Business logic
│   │   ├── kouyou-service.ts
│   │   └── matsuri-service.ts
│   ├── scrapers/
│   │   ├── jma-sakura.ts      # JMA sakura page scraper
│   │   ├── jma-kouyou.ts      # JMA kouyou page scraper
│   │   └── jma-xml.ts         # JMA XML feed parser
│   ├── db/
│   │   ├── schema.sql         # D1 schema
│   │   └── seed.sql           # Location master data
│   ├── middleware/
│   │   ├── auth.ts            # API key validation
│   │   ├── rate-limit.ts      # Rate limiting
│   │   └── cors.ts            # CORS headers
│   ├── lib/
│   │   ├── translate.ts       # JA → EN translation maps
│   │   └── types.ts           # Shared types
│   └── cron/
│       └── ingest.ts          # Scheduled data ingestion
├── test/
│   ├── routes/
│   ├── scrapers/
│   └── fixtures/              # Sample JMA HTML for testing
├── wrangler.toml              # Cloudflare config
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 8. Deployment & Operations

### 8.1 Environments

| Environment | Domain | Purpose |
|-------------|--------|---------|
| Development | `localhost:8787` | Local with Miniflare |
| Staging | `staging.api.japanseasons.com` | Pre-production validation |
| Production | `api.japanseasons.com` | Live |

### 8.2 CI/CD Pipeline

```
Push to main → GitHub Actions → Lint + Test → Deploy to Staging
Tag v*.*.* → GitHub Actions → Deploy to Production
```

### 8.3 Monitoring

- **Uptime:** Cloudflare Health Checks
- **Errors:** Workers Logpush → (optional) Sentry
- **Usage:** D1 analytics for API key usage tracking
- **Alerts:** Discord webhook on error rate spike

## 9. Security

- All traffic over HTTPS (Cloudflare default)
- API keys hashed in D1, never stored plaintext
- Rate limiting per API key + IP fallback
- CORS restricted to registered domains for browser clients
- No PII stored (API keys are opaque tokens)

## 10. Phased Rollout

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| **1** | 2 weeks | Sakura API (forecast + historical + status) |
| **2** | +2 weeks | Kouyou API |
| **3** | +3 weeks | Matsuri API (manual data entry initially) |
| **4** | +1 week | MCP Server wrapping all APIs |
| **5** | +2 weeks | Dashboard, Stripe billing, self-service keys |

**Total estimated timeline: ~10 weeks to full product.**

---

*This is a living document. Updated as decisions are made.*

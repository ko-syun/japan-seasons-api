# Phase 1 Specification — Sakura (Cherry Blossom) API

**Author:** Rin (CTO, KoS LLC)
**Date:** 2026-03-29
**Status:** Draft
**Estimated LOE:** 2 weeks

---

## 1. Scope

Phase 1 delivers a production-ready REST API for Japanese cherry blossom data:

- Current year observation status (which cities have bloomed)
- Historical bloom dates (1953–present, ~58 stations)
- Location metadata (coordinates, region, prefecture)
- Simple "best time to visit" estimation based on historical averages

**Out of scope for Phase 1:**
- Predictive forecasts (requires model development — Phase 2)
- Kouyou, Matsuri data
- MCP server
- Self-service dashboard / Stripe billing
- Webhooks

## 2. API Endpoints

### 2.1 `GET /v1/sakura/status`

Current bloom status across all observation stations.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `region` | string | — | Filter by region: `hokkaido`, `tohoku`, `kanto`, `chubu`, `kansai`, `chugoku`, `shikoku`, `kyushu`, `okinawa` |
| `status` | string | — | Filter: `not_yet`, `blooming`, `full_bloom`, `falling`, `ended` |
| `year` | integer | current | Year (current only for free tier) |

**Response:**
```json
{
  "data": {
    "season": 2026,
    "summary": {
      "total_stations": 58,
      "bloomed": 35,
      "full_bloom": 22,
      "not_yet": 23,
      "ended": 0
    },
    "stations": [
      {
        "location": {
          "id": "tokyo",
          "name": "Tokyo",
          "prefecture": "Tokyo",
          "region": "kanto",
          "coordinates": { "lat": 35.6894, "lon": 139.6917 }
        },
        "status": "full_bloom",
        "bloom_date": "2026-03-20",
        "full_bloom_date": "2026-03-27",
        "normal_bloom_date": "2026-03-24",
        "diff_from_normal_days": -4,
        "tree_species": "somei_yoshino"
      }
    ]
  },
  "meta": {
    "source": "jma",
    "updated_at": "2026-03-29T08:35:00+09:00",
    "attribution": "Data sourced from Japan Meteorological Agency (気象庁)"
  }
}
```

### 2.2 `GET /v1/sakura/forecast`

> **Phase 1 behavior:** Returns historical average dates as "estimated window" since we don't have a forecast model yet. Response clearly labeled as estimate, not forecast.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `city` | string | — | City ID (e.g., `tokyo`, `kyoto`) |
| `region` | string | — | Region filter |

**Response:**
```json
{
  "data": {
    "season": 2026,
    "note": "Dates are historical averages. Actual dates vary by ±7 days depending on weather.",
    "locations": [
      {
        "location": {
          "id": "kyoto",
          "name": "Kyoto",
          "prefecture": "Kyoto",
          "region": "kansai",
          "coordinates": { "lat": 35.0116, "lon": 135.7681 }
        },
        "estimated_bloom_window": {
          "earliest": "2026-03-22",
          "typical": "2026-03-28",
          "latest": "2026-04-05"
        },
        "estimated_full_bloom_window": {
          "earliest": "2026-03-28",
          "typical": "2026-04-04",
          "latest": "2026-04-12"
        },
        "actual": {
          "bloom_date": null,
          "full_bloom_date": null,
          "status": "not_yet"
        },
        "based_on_years": 30,
        "tree_species": "somei_yoshino"
      }
    ]
  },
  "meta": {
    "source": "jma_historical",
    "method": "30-year average with min/max range",
    "attribution": "Based on historical data from Japan Meteorological Agency (気象庁)"
  }
}
```

### 2.3 `GET /v1/sakura/historical`

Historical bloom data for a specific location.

**Query params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `city` | string | Yes | City ID |
| `year` | integer | — | Specific year |
| `from_year` | integer | — | Range start |
| `to_year` | integer | — | Range end |

**Response:**
```json
{
  "data": {
    "location": {
      "id": "tokyo",
      "name": "Tokyo",
      "prefecture": "Tokyo",
      "region": "kanto",
      "coordinates": { "lat": 35.6894, "lon": 139.6917 }
    },
    "records": [
      {
        "year": 2025,
        "bloom_date": "2025-03-21",
        "full_bloom_date": "2025-03-29",
        "diff_from_normal_days": -3,
        "tree_species": "somei_yoshino"
      },
      {
        "year": 2024,
        "bloom_date": "2024-03-29",
        "full_bloom_date": "2024-04-04",
        "diff_from_normal_days": 5,
        "tree_species": "somei_yoshino"
      }
    ],
    "statistics": {
      "years_observed": 72,
      "earliest_bloom": { "date": "03-14", "year": 2023 },
      "latest_bloom": { "date": "04-11", "year": 1984 },
      "average_bloom": "03-24",
      "trend": "Earlier by ~4 days per decade since 1990"
    }
  },
  "meta": {
    "source": "jma",
    "attribution": "Data sourced from Japan Meteorological Agency (気象庁)"
  }
}
```

### 2.4 `GET /v1/sakura/locations`

List all observation stations.

**Response:**
```json
{
  "data": [
    {
      "id": "tokyo",
      "name": "Tokyo",
      "name_ja": "東京",
      "prefecture": "Tokyo",
      "prefecture_ja": "東京都",
      "region": "kanto",
      "coordinates": { "lat": 35.6894, "lon": 139.6917 },
      "tree_species": "somei_yoshino",
      "observation_years": { "from": 1953, "to": 2026 }
    }
  ],
  "meta": {
    "total": 58
  }
}
```

### 2.5 `GET /v1/sakura/recommend`

Travel timing recommendation.

**Query params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `city` | string | — | Target city |
| `region` | string | — | Target region |
| `dates` | string | — | Travel dates, e.g., `2026-03-25/2026-04-05` |

**Response:**
```json
{
  "data": {
    "query": {
      "city": "kyoto",
      "dates": "2026-03-25/2026-04-05"
    },
    "recommendation": {
      "likelihood": "high",
      "confidence": 0.78,
      "summary": "Kyoto typically reaches full bloom in early April. Your travel dates have a high probability of overlapping with peak cherry blossom viewing.",
      "best_days": {
        "estimated_full_bloom_period": "2026-04-01/2026-04-08",
        "overlap_with_travel": "2026-04-01/2026-04-05"
      },
      "alternatives": [
        {
          "city": "tokyo",
          "name": "Tokyo",
          "note": "Blooms ~1 week earlier than Kyoto. Good backup if timing is early.",
          "estimated_full_bloom_period": "2026-03-27/2026-04-03"
        }
      ]
    }
  },
  "meta": {
    "method": "Historical average analysis (30-year window)",
    "disclaimer": "Recommendations based on historical patterns. Actual dates vary with weather conditions."
  }
}
```

## 3. Data Ingestion Pipeline

### 3.1 One-Time Historical Import

Script to scrape all historical JMA data (1953–present):

```
For each decade page (sakura003_00.html through sakura003_07.html):
  1. Fetch HTML
  2. Parse table: extract (location, year, month, day) tuples
  3. Map location names (JA) → location IDs
  4. INSERT INTO sakura_observations
```

**Locations to map:**
- ~58 JMA observation stations (気象官署)
- Each has a standard JMA station ID
- We create our own slugified IDs: "tokyo", "osaka", "sapporo", etc.

### 3.2 Daily Cron (During Season: Feb–May)

```
Schedule: 0 10 * * * (10:00 JST daily)

1. Fetch https://www.data.jma.go.jp/sakura/data/sakura_kaika.html
2. Fetch https://www.data.jma.go.jp/sakura/data/sakura_mankai.html
3. Parse tables for current year
4. UPSERT into sakura_observations
5. Update KV cache for /v1/sakura/status
6. If changes detected, log to monitoring
```

### 3.3 XML Feed Monitor

```
Schedule: 0 */6 * * * (every 6 hours)

1. Fetch JMA XML Atom feed
2. Check for new biological season observation entries
3. Parse XML → extract bloom events
4. UPSERT into sakura_observations
5. Update KV cache
```

### 3.4 Scraper Resilience

- **Retry:** 3 attempts with exponential backoff
- **Validation:** Check parsed data against expected ranges (dates should be March-May for most stations)
- **Alerting:** Discord webhook if scrape fails or returns unexpected structure
- **Fallback:** If HTML structure changes, alert and fall back to last known data

## 4. Translation Map

Japanese location names → English. Stored in code as a static map.

```typescript
const LOCATION_MAP: Record<string, LocationMeta> = {
  "稚内": { id: "wakkanai", name_en: "Wakkanai", prefecture_en: "Hokkaido", region: "hokkaido", lat: 45.4158, lon: 141.6731 },
  "旭川": { id: "asahikawa", name_en: "Asahikawa", prefecture_en: "Hokkaido", region: "hokkaido", lat: 43.7707, lon: 142.3650 },
  "札幌": { id: "sapporo", name_en: "Sapporo", prefecture_en: "Hokkaido", region: "hokkaido", lat: 43.0618, lon: 141.3545 },
  // ... all 58 stations
  "東京": { id: "tokyo", name_en: "Tokyo", prefecture_en: "Tokyo", region: "kanto", lat: 35.6894, lon: 139.6917 },
  "横浜": { id: "yokohama", name_en: "Yokohama", prefecture_en: "Kanagawa", region: "kanto", lat: 35.4437, lon: 139.6380 },
  "京都": { id: "kyoto", name_en: "Kyoto", prefecture_en: "Kyoto", region: "kansai", lat: 35.0116, lon: 135.7681 },
  "大阪": { id: "osaka", name_en: "Osaka", prefecture_en: "Osaka", region: "kansai", lat: 34.6937, lon: 135.5023 },
  // ... etc.
};

const TREE_SPECIES_MAP: Record<string, string> = {
  "": "somei_yoshino",           // Default (most stations)
  "えぞやまざくら": "ezo_yama_zakura",  // Hokkaido stations
  "ひかんざくら": "hikan_zakura",       // Okinawa/southern stations
};

const REGION_MAP: Record<string, string> = {
  "北海道": "hokkaido",
  "東北": "tohoku",
  "関東": "kanto",
  "北陸": "hokuriku",
  "中部": "chubu",
  "東海": "tokai",
  "近畿": "kansai",
  "中国": "chugoku",
  "四国": "shikoku",
  "九州": "kyushu",
  "沖縄": "okinawa",
};
```

## 5. Rate Limiting (Phase 1)

Simple KV-based counter:

```typescript
async function checkRateLimit(apiKey: string, env: Env): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `ratelimit:${apiKey}:${today}`;
  const count = parseInt(await env.KV.get(key) || "0");
  
  const tier = await getTier(apiKey, env);
  const limit = tier === "pro" ? 10000 : 100;
  
  if (count >= limit) return false;
  
  await env.KV.put(key, String(count + 1), { expirationTtl: 86400 });
  return true;
}
```

## 6. API Key Management (Phase 1 — Manual)

Phase 1 uses manually provisioned API keys:

```sql
CREATE TABLE api_keys (
  key_hash TEXT PRIMARY KEY,      -- SHA-256 of the API key
  tier TEXT DEFAULT 'free',       -- "free" | "pro" | "enterprise"
  owner_email TEXT,
  created_at TEXT,
  last_used_at TEXT,
  is_active BOOLEAN DEFAULT 1
);
```

Keys generated via a CLI script, stored hashed. Full self-service in Phase 5.

## 7. Testing Strategy

### 7.1 Unit Tests
- Scraper HTML parsing (with fixture files)
- Translation map completeness
- Date calculation logic
- Rate limit logic

### 7.2 Integration Tests
- Full API endpoint tests with Miniflare
- Database seeding + query validation

### 7.3 Fixture Files
Store sample JMA HTML pages in `test/fixtures/` for reliable scraper testing without hitting JMA servers.

## 8. Deliverables Checklist

- [ ] `wrangler.toml` configured (D1, KV, cron)
- [ ] D1 schema + seed data (locations)
- [ ] Historical data import script
- [ ] JMA HTML scraper (sakura bloom + full bloom)
- [ ] JMA XML feed parser
- [ ] Daily cron ingestion worker
- [ ] `GET /v1/sakura/status`
- [ ] `GET /v1/sakura/forecast` (historical average method)
- [ ] `GET /v1/sakura/historical`
- [ ] `GET /v1/sakura/locations`
- [ ] `GET /v1/sakura/recommend`
- [ ] Rate limiting middleware
- [ ] API key auth middleware
- [ ] CORS middleware
- [ ] Unit tests for scraper
- [ ] Integration tests for all endpoints
- [ ] README with setup instructions
- [ ] Deploy to staging

## 9. Success Criteria

Phase 1 is "done" when:
1. All 5 endpoints return correct data for all 58 JMA stations
2. Historical data loaded from 1953–present
3. Daily cron successfully ingests new data
4. Rate limiting works correctly
5. Response times < 100ms at edge
6. Tests passing in CI

---

*This spec is implementation-ready. Next step: scaffold the project and start coding.*

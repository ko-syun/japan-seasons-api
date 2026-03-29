const BASE_URL = "https://jpseasons.dokos.dev";

// ── robots.txt ──
export const robotsTxt = `User-agent: *
Allow: /

# AI Crawlers - explicitly allowed
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: anthropic-ai
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

// ── sitemap.xml ──
export const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/dashboard</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/health</loc>
    <changefreq>daily</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
`;

// ── llms.txt — AI-readable API summary ──
export const llmsTxt = `# Japan Seasons API

> REST API for Japanese seasonal data. Cherry blossoms, autumn foliage, and festivals.

## Base URL
${BASE_URL}

## Authentication
All /v1/* endpoints require an API key via \`X-API-Key\` header or \`api_key\` query parameter.
Get a free key at ${BASE_URL}/dashboard

## Endpoints

### Sakura (Cherry Blossom)
- GET /v1/sakura/status — Current bloom status across 57 JMA observation stations
- GET /v1/sakura/forecast — Bloom date forecast based on 30-year historical averages
- GET /v1/sakura/historical?city={id} — Historical bloom records (1953-present)
- GET /v1/sakura/locations — List all 57 observation stations with coordinates
- GET /v1/sakura/recommend?city={id}&dates=YYYY-MM-DD/YYYY-MM-DD — Best time to visit recommendation

### Kouyou (Autumn Foliage)
- GET /v1/kouyou/status — Current leaf color status across 53 stations
- GET /v1/kouyou/forecast — Color change forecast
- GET /v1/kouyou/historical?city={id} — Historical records
- GET /v1/kouyou/locations — List all observation stations
- GET /v1/kouyou/recommend?city={id}&dates=YYYY-MM-DD/YYYY-MM-DD — Best time to visit

### Matsuri (Festivals)
- GET /v1/matsuri/search?region={region}&month={1-12}&category={cat} — Search 50+ festivals
- GET /v1/matsuri/upcoming?days={30} — Upcoming festivals
- GET /v1/matsuri/{id} — Festival details

## MCP (Model Context Protocol)
Endpoint: ${BASE_URL}/mcp
Transport: Streamable HTTP
10 tools available for AI agent integration.

## Pricing
- Free: 100 requests/day, current year data
- Pro ($29/mo): 10K requests/day, historical data, webhooks
- Enterprise: Custom pricing, SLA

## Data Sources
- Japan Meteorological Agency (気象庁) — sakura & kouyou observations since 1953
- Curated festival database — 50+ major Japanese festivals

## Example
\`\`\`
curl -H "X-API-Key: YOUR_KEY" ${BASE_URL}/v1/sakura/forecast?city=tokyo
\`\`\`

## Links
- Dashboard: ${BASE_URL}/dashboard
- GitHub: https://github.com/ko-syun/japan-seasons-api
- MCP: ${BASE_URL}/mcp
`;

// ── llms-full.txt — Detailed API spec for AI agents ──
export const llmsFullTxt = `# Japan Seasons API — Full Specification

${llmsTxt}

## Detailed Response Formats

### Sakura Status Response
\`\`\`json
{
  "data": {
    "season": 2026,
    "summary": {
      "total_stations": 57,
      "bloomed": 30,
      "full_bloom": 15,
      "not_yet": 20,
      "ended": 7
    },
    "stations": [{
      "location": { "id": "tokyo", "name": "Tokyo", "prefecture": "Tokyo", "region": "kanto", "coordinates": { "lat": 35.6894, "lon": 139.6917 } },
      "status": "full_bloom",
      "bloom_date": "2026-03-20",
      "full_bloom_date": "2026-03-27",
      "tree_species": "somei_yoshino"
    }]
  }
}
\`\`\`

### Forecast Response
\`\`\`json
{
  "data": {
    "season": 2026,
    "locations": [{
      "location": { "id": "tokyo", "name": "Tokyo" },
      "estimated_bloom_window": { "earliest": "2026-03-14", "typical": "2026-03-22", "latest": "2026-03-31" },
      "estimated_full_bloom_window": { "earliest": "2026-03-21", "typical": "2026-03-30", "latest": "2026-04-07" },
      "based_on_years": 30
    }]
  }
}
\`\`\`

### Historical Response
\`\`\`json
{
  "data": {
    "location": { "id": "tokyo", "name": "Tokyo" },
    "records": [{ "year": 2025, "bloom_date": "2025-03-20", "full_bloom_date": "2025-03-28" }],
    "statistics": {
      "years_observed": 73,
      "earliest_bloom": { "date": "03-14", "year": 2023 },
      "latest_bloom": { "date": "04-11", "year": 1984 },
      "average_bloom": "03-26",
      "trend": "Earlier by ~2 days per decade since 1990"
    }
  }
}
\`\`\`

### Recommend Response
\`\`\`json
{
  "data": {
    "query": { "city": "kyoto", "dates": "2026-03-28/2026-04-05" },
    "recommendation": {
      "likelihood": "high",
      "confidence": 0.95,
      "summary": "Kyoto typically reaches full bloom in April.",
      "best_days": { "estimated_full_bloom_period": "2026-03-24/2026-04-10" },
      "alternatives": [{ "city": "tokyo", "name": "Tokyo" }]
    }
  }
}
\`\`\`

### Matsuri Search Response
\`\`\`json
{
  "data": [{
    "id": "gion-matsuri",
    "name_en": "Gion Matsuri",
    "name_ja": "祇園祭",
    "city": "Kyoto",
    "region": "kansai",
    "month": 7,
    "category": ["float", "traditional"],
    "estimated_visitors": 800000
  }],
  "meta": { "total": 50, "limit": 20, "offset": 0 }
}
\`\`\`

## City IDs (Sakura)
tokyo, osaka, kyoto, yokohama, nagoya, sapporo, fukuoka, sendai, hiroshima, kobe, naha, kagoshima, nagano, kanazawa, matsuyama, etc.

## Regions
hokkaido, tohoku, kanto, chubu, kansai, chugoku, shikoku, kyushu, okinawa

## Error Codes
- 401: MISSING_API_KEY — No API key provided
- 403: INVALID_API_KEY — Key invalid or deactivated
- 429: RATE_LIMIT_EXCEEDED — Daily limit reached
- 400: MISSING_PARAMETER / INVALID_DATE_FORMAT
- 404: INVALID_CITY / NOT_FOUND
`;

// ── JSON-LD Structured Data ──
export const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebAPI",
  "name": "Japan Seasons API",
  "description": "REST API for Japanese seasonal data: cherry blossom forecasts, autumn foliage tracking, and festival listings.",
  "url": BASE_URL,
  "documentationUrl": `${BASE_URL}/#docs`,
  "provider": {
    "@type": "Organization",
    "name": "KoS LLC",
    "url": "https://dokos.dev"
  },
  "termsOfService": "https://dokos.dev/legal",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "USD",
      "description": "100 requests/day, current year data"
    },
    {
      "@type": "Offer",
      "name": "Pro",
      "price": "29",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "billingDuration": "P1M"
      },
      "description": "10K requests/day, historical data, webhooks"
    }
  ]
});

// ── /.well-known/ai-plugin.json (OpenAI plugin discovery) ──
export const aiPluginJson = JSON.stringify({
  "schema_version": "v1",
  "name_for_human": "Japan Seasons API",
  "name_for_model": "japan_seasons",
  "description_for_human": "Get cherry blossom forecasts, autumn foliage tracking, and Japanese festival information.",
  "description_for_model": "API for Japanese seasonal data. Use this to get cherry blossom (sakura) bloom status and forecasts, autumn foliage (kouyou) tracking, and Japanese festival (matsuri) information. Covers 57 observation stations with data from 1953 to present.",
  "auth": {
    "type": "user_http",
    "authorization_type": "custom_header",
    "custom_auth_header": "X-API-Key"
  },
  "api": {
    "type": "openapi",
    "url": `${BASE_URL}/llms-full.txt`
  },
  "logo_url": `${BASE_URL}`,
  "contact_email": "jun@dokos.dev",
  "legal_info_url": "https://dokos.dev/legal"
}, null, 2);

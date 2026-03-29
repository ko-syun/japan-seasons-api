# Japan Seasons API

REST API for Japanese cherry blossom (sakura) observation data, powered by Cloudflare Workers + D1.

## Quick Start

```bash
# Install dependencies
npm install

# Set up local D1 database
npm run db:migrate
npm run db:seed

# Start dev server
npm run dev

# Run tests
npm test

# Type check
npm run build
```

## API Endpoints

All endpoints require an API key via `X-API-Key` header or `api_key` query parameter.

| Endpoint | Description |
|---|---|
| `GET /v1/sakura/status` | Current bloom status across all stations |
| `GET /v1/sakura/forecast` | Historical average bloom estimates |
| `GET /v1/sakura/historical` | Historical bloom data with statistics |
| `GET /v1/sakura/locations` | List all 58 JMA observation stations |
| `GET /v1/sakura/recommend` | Travel timing recommendations |

## Data Source

All observation data sourced from **Japan Meteorological Agency (気象庁)** under the Japan Public Data License v1.0.

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Framework:** Hono v4
- **Database:** Cloudflare D1 (SQLite)
- **Cache:** Cloudflare KV
- **Language:** TypeScript (strict)
- **Tests:** Vitest + Miniflare

## Project Structure

```
src/
  index.ts          - Hono app entry point
  routes/           - API route handlers
  middleware/        - Auth, rate limit, CORS
  services/         - Business logic
  scrapers/         - JMA data scrapers
  data/             - Static location/region maps
  db/               - Schema and seed SQL
  scripts/          - Historical import script
  cron/             - Scheduled data ingestion
test/
  routes/           - API integration tests
  scrapers/         - Scraper unit tests
  middleware/       - Middleware tests
  fixtures/         - Sample JMA HTML
```

## License

Proprietary — KoS LLC

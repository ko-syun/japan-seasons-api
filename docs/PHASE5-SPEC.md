# Phase 5 Specification — Dashboard + Stripe Billing

**Date:** 2026-03-29
**Status:** Planned

---

## Overview

Self-service developer portal:
1. Sign up / login (email + password or GitHub OAuth)
2. Generate API keys
3. View usage stats
4. Upgrade tier (Free → Pro → Enterprise)

## Architecture

- **Frontend:** Static HTML/JS dashboard served from Workers
  - Cloudflare Pages or Workers Sites
  - Lightweight: vanilla JS or Preact (no heavy frameworks)
  - Tailwind CSS for styling
- **Backend:** Same Workers API + new `/dashboard/api/` routes
- **Auth:** JWT tokens stored in httpOnly cookies
- **Payments:** Stripe Checkout + Customer Portal

## Tiers

| Tier | Price | Rate Limit | Features |
|------|-------|------------|----------|
| Free | $0 | 100 req/day | Current year, basic endpoints |
| Pro | $29/mo | 10K req/day | Historical data, recommend, webhooks |
| Enterprise | Custom | 100K req/day | SLA, priority support |

## API Endpoints

### Auth
- `POST /dashboard/api/signup` — Email + password
- `POST /dashboard/api/login` — Returns JWT
- `POST /dashboard/api/logout` — Clear cookie

### Keys
- `GET /dashboard/api/keys` — List user's API keys
- `POST /dashboard/api/keys` — Generate new key (returns plaintext once)
- `DELETE /dashboard/api/keys/:id` — Revoke key

### Usage
- `GET /dashboard/api/usage` — Daily/monthly usage stats

### Billing
- `POST /dashboard/api/checkout` — Create Stripe Checkout session
- `POST /dashboard/api/portal` — Create Stripe Customer Portal session
- `POST /webhooks/stripe` — Stripe webhook handler

## DB Schema Additions

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  stripe_customer_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE api_keys ADD COLUMN user_id TEXT REFERENCES users(id);
ALTER TABLE api_keys ADD COLUMN name TEXT DEFAULT 'default';
```

## Stripe Integration

1. **Checkout:** Create session → redirect to Stripe → webhook confirms payment → upgrade tier
2. **Customer Portal:** Self-service subscription management
3. **Webhooks:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Required Secrets (wrangler)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `JWT_SECRET`

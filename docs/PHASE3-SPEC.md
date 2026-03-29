# Phase 3 Specification — Matsuri (Festival) API

**Date:** 2026-03-29
**Status:** In Progress

---

## Endpoints

### `GET /v1/matsuri/search`
Search festivals by location, month, category.

**Query params:**
- `region?` — hokkaido, tohoku, kanto, chubu, kansai, chugoku, shikoku, kyushu, okinawa
- `month?` — 1-12
- `city?` — City/prefecture name
- `category?` — fire, dance, float, lantern, snow, cherry_blossom, autumn, traditional, modern
- `limit?` — Default 20, max 100
- `offset?` — Pagination

**Response:**
```json
{
  "data": [{
    "id": "gion-matsuri",
    "name_en": "Gion Festival",
    "name_ja": "祇園祭",
    "city": "Kyoto",
    "prefecture": "Kyoto",
    "region": "kansai",
    "month": 7,
    "dates": "July 1-31 (main procession July 17 & 24)",
    "date_start": "07-01",
    "date_end": "07-31",
    "highlight_dates": ["07-17", "07-24"],
    "category": ["float", "traditional"],
    "description_en": "One of Japan's three great festivals...",
    "description_ja": "日本三大祭りの一つ...",
    "estimated_visitors": 800000,
    "access": "Shijo Station (Kyoto)",
    "coordinates": { "lat": 35.0037, "lon": 135.7785 },
    "tips_en": "Book accommodations months in advance...",
    "image_url": null,
    "official_url": "https://www.gionmatsuri.or.jp/"
  }],
  "meta": { "total": 200, "limit": 20, "offset": 0 }
}
```

### `GET /v1/matsuri/upcoming`
Festivals in the next 30-60 days.

**Query params:**
- `days?` — Default 30, max 90
- `region?` — Filter by region
- `limit?` — Default 20

### `GET /v1/matsuri/{id}`
Single festival detail.

---

## Data Model

```sql
CREATE TABLE IF NOT EXISTS matsuri (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  city TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  region TEXT NOT NULL,
  month INTEGER NOT NULL,
  date_start TEXT,
  date_end TEXT,
  highlight_dates TEXT,  -- JSON array
  category TEXT NOT NULL, -- JSON array
  description_en TEXT,
  description_ja TEXT,
  estimated_visitors INTEGER,
  access TEXT,
  latitude REAL,
  longitude REAL,
  tips_en TEXT,
  official_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);
```

## Initial Data: Top 50 Festivals

Curated list focusing on most famous + seasonally distributed festivals.

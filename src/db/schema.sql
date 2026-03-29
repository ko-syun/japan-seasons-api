-- Japan Seasons API - D1 Schema
-- Phase 1: Sakura observations

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  prefecture_en TEXT NOT NULL,
  prefecture_ja TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  tree_species TEXT NOT NULL DEFAULT 'somei_yoshino'
);

CREATE TABLE IF NOT EXISTS sakura_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id TEXT NOT NULL REFERENCES locations(id),
  year INTEGER NOT NULL,
  bloom_date TEXT,
  full_bloom_date TEXT,
  bloom_status TEXT DEFAULT 'not_yet',
  normal_bloom_date TEXT,
  normal_full_bloom_date TEXT,
  diff_from_normal INTEGER,
  tree_species TEXT DEFAULT 'somei_yoshino',
  source TEXT NOT NULL DEFAULT 'jma',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(location_id, year, source)
);

CREATE TABLE IF NOT EXISTS api_keys (
  key_hash TEXT PRIMARY KEY,
  tier TEXT NOT NULL DEFAULT 'free',
  owner_email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sakura_location_year
  ON sakura_observations(location_id, year);

CREATE INDEX IF NOT EXISTS idx_sakura_year_status
  ON sakura_observations(year, bloom_status);

CREATE INDEX IF NOT EXISTS idx_sakura_year
  ON sakura_observations(year);

CREATE INDEX IF NOT EXISTS idx_locations_region
  ON locations(region);

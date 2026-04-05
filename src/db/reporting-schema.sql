-- Request logs (aggregated daily per endpoint+key+tier to keep D1 small)
CREATE TABLE IF NOT EXISTS daily_request_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,              -- YYYY-MM-DD
  endpoint TEXT NOT NULL,          -- e.g. /v1/sakura/status
  key_hash TEXT NOT NULL,          -- or "x402" for x402 payments
  tier TEXT NOT NULL,              -- free/pro/payg/x402
  request_count INTEGER NOT NULL DEFAULT 0,
  error_4xx INTEGER NOT NULL DEFAULT 0,
  error_5xx INTEGER NOT NULL DEFAULT 0,
  rate_limited INTEGER NOT NULL DEFAULT 0,
  UNIQUE(date, endpoint, key_hash)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_request_stats(date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date_tier ON daily_request_stats(date, tier);

-- x402 payment records
CREATE TABLE IF NOT EXISTS x402_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL,
  amount_base_units INTEGER NOT NULL,  -- USDC base units (6 decimals)
  tx_hash TEXT,
  network TEXT NOT NULL DEFAULT "base",
  settled_at TEXT NOT NULL DEFAULT (datetime("now")),
  UNIQUE(tx_hash)
);

CREATE INDEX IF NOT EXISTS idx_x402_payments_date ON x402_payments(settled_at);

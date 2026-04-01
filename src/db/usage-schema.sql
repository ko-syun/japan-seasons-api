-- Phase 6A: Usage-Based Billing (Pay-as-you-go)

CREATE TABLE IF NOT EXISTS usage_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_hash TEXT NOT NULL,
  date TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  reported_to_stripe INTEGER NOT NULL DEFAULT 0,
  UNIQUE(key_hash, date)
);

CREATE TABLE IF NOT EXISTS subscription_items (
  user_id TEXT NOT NULL,
  stripe_subscription_item_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_usage_records_unreported
  ON usage_records(reported_to_stripe, date);

CREATE INDEX IF NOT EXISTS idx_usage_records_key_date
  ON usage_records(key_hash, date);

/**
 * Shared test database setup.
 * D1 exec in Miniflare requires single-statement, single-line SQL.
 */
export async function createTables(DB: D1Database): Promise<void> {
  await DB.exec("CREATE TABLE IF NOT EXISTS locations (id TEXT PRIMARY KEY, name_en TEXT NOT NULL, name_ja TEXT NOT NULL, prefecture_en TEXT NOT NULL, prefecture_ja TEXT NOT NULL, region TEXT NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, tree_species TEXT NOT NULL DEFAULT 'somei_yoshino')");

  await DB.exec("CREATE TABLE IF NOT EXISTS sakura_observations (id INTEGER PRIMARY KEY AUTOINCREMENT, location_id TEXT NOT NULL, year INTEGER NOT NULL, bloom_date TEXT, full_bloom_date TEXT, bloom_status TEXT DEFAULT 'not_yet', normal_bloom_date TEXT, normal_full_bloom_date TEXT, diff_from_normal INTEGER, tree_species TEXT DEFAULT 'somei_yoshino', source TEXT NOT NULL DEFAULT 'jma', updated_at TEXT NOT NULL, UNIQUE(location_id, year, source))");

  await DB.exec("CREATE TABLE IF NOT EXISTS kouyou_observations (id INTEGER PRIMARY KEY AUTOINCREMENT, location_id TEXT NOT NULL, year INTEGER NOT NULL, color_date TEXT, fall_date TEXT, color_status TEXT DEFAULT 'not_yet', normal_color_date TEXT, normal_fall_date TEXT, diff_from_normal INTEGER, tree_species TEXT DEFAULT 'iroha_kaede', source TEXT NOT NULL DEFAULT 'jma', updated_at TEXT NOT NULL, UNIQUE(location_id, year, source))");

  await DB.exec("CREATE TABLE IF NOT EXISTS api_keys (key_hash TEXT PRIMARY KEY, tier TEXT NOT NULL DEFAULT 'free', owner_email TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, last_used_at TEXT, is_active INTEGER NOT NULL DEFAULT 1)");
}

export async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function seedApiKey(DB: D1Database, key: string, tier = "free"): Promise<void> {
  const keyHash = await hashKey(key);
  await DB.exec(`INSERT OR IGNORE INTO api_keys (key_hash, tier, is_active) VALUES ('${keyHash}', '${tier}', 1)`);
}

export async function seedLocations(DB: D1Database): Promise<void> {
  await DB.exec("INSERT OR IGNORE INTO locations VALUES ('tokyo', 'Tokyo', '東京', 'Tokyo', '東京都', 'kanto', 35.6894, 139.6917, 'somei_yoshino')");
  await DB.exec("INSERT OR IGNORE INTO locations VALUES ('osaka', 'Osaka', '大阪', 'Osaka', '大阪府', 'kansai', 34.6937, 135.5023, 'somei_yoshino')");
  await DB.exec("INSERT OR IGNORE INTO locations VALUES ('kyoto', 'Kyoto', '京都', 'Kyoto', '京都府', 'kansai', 35.0116, 135.7681, 'somei_yoshino')");
}

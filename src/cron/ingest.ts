import type { Env, BloomStatus } from "../types.js";
import {
  fetchWithRetry,
  parseCurrentYearPage,
  JMA_CURRENT_URLS,
} from "../scrapers/jmaHtml.js";
import { resolveLocation } from "../data/locations.js";
import { invalidateCache, CACHE_KEYS } from "../services/cacheService.js";

/**
 * Scheduled handler: runs daily to scrape current-year JMA data.
 * Updates D1 and invalidates KV cache.
 */
export async function handleScheduled(
  _event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const year = new Date().getFullYear();

  try {
    await scrapeAndUpsert(env, year);
    ctx.waitUntil(
      invalidateCache(env.KV, CACHE_KEYS.status, CACHE_KEYS.forecast)
    );
  } catch (err) {
    // Structured error logging
    const message = err instanceof Error ? err.message : String(err);
    // In production, this would go to Logpush/Sentry
    // Avoid console.log — Workers Logpush captures thrown errors
    throw new Error(`Cron ingest failed: ${message}`);
  }
}

async function scrapeAndUpsert(env: Env, year: number): Promise<void> {
  // Fetch bloom and full-bloom pages
  const [bloomHtml, fullBloomHtml] = await Promise.all([
    fetchWithRetry(JMA_CURRENT_URLS.bloom),
    fetchWithRetry(JMA_CURRENT_URLS.fullBloom),
  ]);

  const bloomObs = parseCurrentYearPage(bloomHtml, year);
  const fullBloomObs = parseCurrentYearPage(fullBloomHtml, year);

  // Build a map of location_id → { bloom_date, full_bloom_date }
  const dataMap = new Map<
    string,
    { bloom_date: string | null; full_bloom_date: string | null }
  >();

  for (const obs of bloomObs) {
    const loc = resolveLocation(obs.location_ja);
    if (!loc) continue;

    const date =
      obs.month && obs.day
        ? `${year}-${String(obs.month).padStart(2, "0")}-${String(obs.day).padStart(2, "0")}`
        : null;

    const existing = dataMap.get(loc.id) ?? {
      bloom_date: null,
      full_bloom_date: null,
    };
    existing.bloom_date = date;
    dataMap.set(loc.id, existing);
  }

  for (const obs of fullBloomObs) {
    const loc = resolveLocation(obs.location_ja);
    if (!loc) continue;

    const date =
      obs.month && obs.day
        ? `${year}-${String(obs.month).padStart(2, "0")}-${String(obs.day).padStart(2, "0")}`
        : null;

    const existing = dataMap.get(loc.id) ?? {
      bloom_date: null,
      full_bloom_date: null,
    };
    existing.full_bloom_date = date;
    dataMap.set(loc.id, existing);
  }

  // Batch upsert
  const stmt = env.DB.prepare(`
    INSERT INTO sakura_observations
      (location_id, year, bloom_date, full_bloom_date, bloom_status, source, updated_at)
    VALUES (?, ?, ?, ?, ?, 'jma', datetime('now'))
    ON CONFLICT(location_id, year, source) DO UPDATE SET
      bloom_date = COALESCE(excluded.bloom_date, bloom_date),
      full_bloom_date = COALESCE(excluded.full_bloom_date, full_bloom_date),
      bloom_status = excluded.bloom_status,
      updated_at = datetime('now')
  `);

  const batch = [...dataMap.entries()].map(([locationId, data]) => {
    const status = deriveStatus(data.bloom_date, data.full_bloom_date);
    return stmt.bind(
      locationId,
      year,
      data.bloom_date,
      data.full_bloom_date,
      status
    );
  });

  if (batch.length > 0) {
    await env.DB.batch(batch);
  }
}

function deriveStatus(
  bloomDate: string | null,
  fullBloomDate: string | null
): BloomStatus {
  if (!bloomDate) return "not_yet";
  if (!fullBloomDate) return "blooming";

  const now = new Date();
  const fullBloom = new Date(fullBloomDate);
  const daysSinceFullBloom = Math.floor(
    (now.getTime() - fullBloom.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceFullBloom < 0) return "blooming";
  if (daysSinceFullBloom <= 5) return "full_bloom";
  if (daysSinceFullBloom <= 14) return "falling";
  return "ended";
}

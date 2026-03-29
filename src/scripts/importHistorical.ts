/**
 * Historical data import script.
 * Scrapes JMA decade pages and inserts into D1.
 *
 * Usage (via wrangler):
 *   wrangler d1 execute japan-seasons-db --local --file=src/db/schema.sql
 *   wrangler d1 execute japan-seasons-db --local --file=src/db/seed.sql
 *   wrangler dev --test-scheduled   # then trigger manually
 *
 * Or run as a one-off worker script:
 *   This exports a handler that can be invoked via HTTP in dev mode.
 */

import type { Env } from "../types.js";
import {
  fetchWithRetry,
  parseHistoricalDecadePage,
  JMA_HISTORICAL_PAGES,
} from "../scrapers/jmaHtml.js";
import { resolveLocation } from "../data/locations.js";

interface ImportStats {
  pagesProcessed: number;
  rowsInserted: number;
  errors: string[];
}

export async function importHistoricalData(
  env: Env
): Promise<ImportStats> {
  const stats: ImportStats = {
    pagesProcessed: 0,
    rowsInserted: 0,
    errors: [],
  };

  // Import bloom dates
  for (const page of JMA_HISTORICAL_PAGES.bloom) {
    try {
      const html = await fetchWithRetry(page.url);
      const observations = parseHistoricalDecadePage(
        html,
        page.startYear,
        page.endYear
      );

      const inserted = await batchInsertBloom(
        env.DB,
        observations,
        "bloom"
      );
      stats.rowsInserted += inserted;
      stats.pagesProcessed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      stats.errors.push(`bloom ${page.url}: ${msg}`);
    }
  }

  // Import full-bloom dates
  for (const page of JMA_HISTORICAL_PAGES.fullBloom) {
    try {
      const html = await fetchWithRetry(page.url);
      const observations = parseHistoricalDecadePage(
        html,
        page.startYear,
        page.endYear
      );

      const inserted = await batchInsertBloom(
        env.DB,
        observations,
        "full_bloom"
      );
      stats.rowsInserted += inserted;
      stats.pagesProcessed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      stats.errors.push(`full_bloom ${page.url}: ${msg}`);
    }
  }

  return stats;
}

async function batchInsertBloom(
  db: D1Database,
  observations: Array<{
    location_ja: string;
    year: number;
    month: number | null;
    day: number | null;
  }>,
  type: "bloom" | "full_bloom"
): Promise<number> {
  const dateCol =
    type === "bloom" ? "bloom_date" : "full_bloom_date";

  const stmts: D1PreparedStatement[] = [];

  for (const obs of observations) {
    const loc = resolveLocation(obs.location_ja);
    if (!loc) continue;

    const date =
      obs.month && obs.day
        ? `${obs.year}-${String(obs.month).padStart(2, "0")}-${String(obs.day).padStart(2, "0")}`
        : null;

    if (!date) continue;

    if (type === "bloom") {
      stmts.push(
        db
          .prepare(
            `INSERT INTO sakura_observations (location_id, year, bloom_date, source, updated_at)
             VALUES (?, ?, ?, 'jma', datetime('now'))
             ON CONFLICT(location_id, year, source) DO UPDATE SET
               bloom_date = excluded.bloom_date,
               updated_at = datetime('now')`
          )
          .bind(loc.id, obs.year, date)
      );
    } else {
      stmts.push(
        db
          .prepare(
            `INSERT INTO sakura_observations (location_id, year, full_bloom_date, source, updated_at)
             VALUES (?, ?, ?, 'jma', datetime('now'))
             ON CONFLICT(location_id, year, source) DO UPDATE SET
               full_bloom_date = excluded.full_bloom_date,
               updated_at = datetime('now')`
          )
          .bind(loc.id, obs.year, date)
      );
    }
  }

  // D1 batch has a limit; process in chunks of 100
  const CHUNK_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < stmts.length; i += CHUNK_SIZE) {
    const chunk = stmts.slice(i, i + CHUNK_SIZE);
    await db.batch(chunk);
    inserted += chunk.length;
  }

  return inserted;
}

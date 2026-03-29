import type {
  Env,
  BloomStatus,
  StatusSummary,
  StationStatus,
  ForecastLocation,
  HistoricalRecord,
  HistoricalStatistics,
  LocationRef,
  DateWindow,
} from "../types.js";
import { LOCATION_BY_ID, toLocationRef } from "../data/locations.js";
import { diffDays, toMonthDay } from "../scrapers/parser.js";

// ── Status ──

export async function getStationStatuses(
  db: D1Database,
  year: number,
  region?: string,
  status?: string
): Promise<StationStatus[]> {
  let query = `
    SELECT so.*, l.region, l.tree_species as loc_species
    FROM sakura_observations so
    JOIN locations l ON so.location_id = l.id
    WHERE so.year = ?
  `;
  const params: unknown[] = [year];

  if (region) {
    query += " AND l.region = ?";
    params.push(region);
  }
  if (status) {
    query += " AND so.bloom_status = ?";
    params.push(status);
  }

  query += " ORDER BY l.latitude DESC";

  const result = await db
    .prepare(query)
    .bind(...params)
    .all<Record<string, unknown>>();

  return result.results.map((row) => {
    const loc = LOCATION_BY_ID[row.location_id as string];
    if (!loc) return null;

    return {
      location: toLocationRef(loc),
      status: (row.bloom_status as BloomStatus) ?? "not_yet",
      bloom_date: row.bloom_date as string | null,
      full_bloom_date: row.full_bloom_date as string | null,
      normal_bloom_date: row.normal_bloom_date as string | null,
      diff_from_normal_days: row.diff_from_normal as number | null,
      tree_species: loc.tree_species,
    };
  }).filter(Boolean) as StationStatus[];
}

export function buildStatusSummary(stations: StationStatus[]): StatusSummary {
  return {
    total_stations: stations.length,
    bloomed: stations.filter(
      (s) =>
        s.status === "blooming" ||
        s.status === "full_bloom" ||
        s.status === "falling" ||
        s.status === "ended"
    ).length,
    full_bloom: stations.filter((s) => s.status === "full_bloom").length,
    not_yet: stations.filter(
      (s) => s.status === "not_yet" || s.status === "budding"
    ).length,
    ended: stations.filter((s) => s.status === "ended").length,
  };
}

// ── Forecast (historical average) ──

export async function getForecastData(
  db: D1Database,
  year: number,
  city?: string,
  region?: string
): Promise<ForecastLocation[]> {
  let locationFilter = "";
  const params: unknown[] = [];

  if (city) {
    locationFilter = "WHERE id = ?";
    params.push(city);
  } else if (region) {
    locationFilter = "WHERE region = ?";
    params.push(region);
  }

  // Get historical averages (last 30 years)
  const minYear = year - 30;
  const locations = await db
    .prepare(
      `SELECT id, region, tree_species FROM locations ${locationFilter} ORDER BY latitude DESC`
    )
    .bind(...params)
    .all<{ id: string; region: string; tree_species: string }>();

  const forecasts: ForecastLocation[] = [];

  for (const loc of locations.results) {
    const meta = LOCATION_BY_ID[loc.id];
    if (!meta) continue;

    const stats = await db
      .prepare(
        `SELECT bloom_date, full_bloom_date
         FROM sakura_observations
         WHERE location_id = ? AND year >= ? AND year < ?
           AND bloom_date IS NOT NULL`
      )
      .bind(loc.id, minYear, year)
      .all<{ bloom_date: string; full_bloom_date: string | null }>();

    const bloomDates = stats.results
      .map((r) => r.bloom_date)
      .filter(Boolean)
      .map((d) => toMonthDay(d)!)
      .sort();

    const fullBloomDates = stats.results
      .map((r) => r.full_bloom_date)
      .filter(Boolean)
      .map((d) => toMonthDay(d)!)
      .sort();

    const bloomWindow = computeWindow(bloomDates, year);
    const fullBloomWindow = computeWindow(fullBloomDates, year);

    // Get current year actual data
    const actual = await db
      .prepare(
        `SELECT bloom_date, full_bloom_date, bloom_status
         FROM sakura_observations
         WHERE location_id = ? AND year = ?`
      )
      .bind(loc.id, year)
      .first<{
        bloom_date: string | null;
        full_bloom_date: string | null;
        bloom_status: string | null;
      }>();

    forecasts.push({
      location: toLocationRef(meta),
      estimated_bloom_window: bloomWindow,
      estimated_full_bloom_window: fullBloomWindow,
      actual: {
        bloom_date: actual?.bloom_date ?? null,
        full_bloom_date: actual?.full_bloom_date ?? null,
        status: (actual?.bloom_status as BloomStatus) ?? "not_yet",
      },
      based_on_years: bloomDates.length,
      tree_species: meta.tree_species,
    });
  }

  return forecasts;
}

function computeWindow(
  sortedMonthDays: string[],
  year: number
): DateWindow {
  if (sortedMonthDays.length === 0) {
    return { earliest: "", typical: "", latest: "" };
  }

  const earliest = sortedMonthDays[0];
  const latest = sortedMonthDays[sortedMonthDays.length - 1];
  const midIdx = Math.floor(sortedMonthDays.length / 2);
  const typical = sortedMonthDays[midIdx];

  return {
    earliest: `${year}-${earliest}`,
    typical: `${year}-${typical}`,
    latest: `${year}-${latest}`,
  };
}

// ── Historical ──

export async function getHistoricalRecords(
  db: D1Database,
  city: string,
  fromYear?: number,
  toYear?: number
): Promise<HistoricalRecord[]> {
  let query = `
    SELECT year, bloom_date, full_bloom_date,
           diff_from_normal, tree_species
    FROM sakura_observations
    WHERE location_id = ?
  `;
  const params: unknown[] = [city];

  if (fromYear) {
    query += " AND year >= ?";
    params.push(fromYear);
  }
  if (toYear) {
    query += " AND year <= ?";
    params.push(toYear);
  }

  query += " ORDER BY year DESC";

  const result = await db
    .prepare(query)
    .bind(...params)
    .all<Record<string, unknown>>();

  return result.results.map((row) => ({
    year: row.year as number,
    bloom_date: row.bloom_date as string | null,
    full_bloom_date: row.full_bloom_date as string | null,
    diff_from_normal_days: row.diff_from_normal as number | null,
    tree_species: (row.tree_species as string) ?? "somei_yoshino",
  }));
}

export function computeStatistics(
  records: HistoricalRecord[]
): HistoricalStatistics {
  const withBloom = records.filter((r) => r.bloom_date);

  if (withBloom.length === 0) {
    return {
      years_observed: 0,
      earliest_bloom: null,
      latest_bloom: null,
      average_bloom: null,
      trend: "Insufficient data",
    };
  }

  // Find earliest and latest bloom (by month-day)
  let earliest = { date: "12-31", year: 0 };
  let latest = { date: "01-01", year: 0 };
  let totalDayOfYear = 0;

  for (const rec of withBloom) {
    const md = toMonthDay(rec.bloom_date!)!;
    if (md < earliest.date) {
      earliest = { date: md, year: rec.year };
    }
    if (md > latest.date) {
      latest = { date: md, year: rec.year };
    }
    // Day-of-year approximation for average
    const month = parseInt(md.slice(0, 2), 10);
    const day = parseInt(md.slice(3, 5), 10);
    totalDayOfYear += (month - 1) * 30 + day;
  }

  const avgDay = Math.round(totalDayOfYear / withBloom.length);
  const avgMonth = Math.floor(avgDay / 30) + 1;
  const avgDayOfMonth = avgDay % 30 || 1;
  const avgBloom = `${String(avgMonth).padStart(2, "0")}-${String(avgDayOfMonth).padStart(2, "0")}`;

  // Simple trend: compare pre-1990 vs post-1990 averages
  const trend = computeTrend(withBloom);

  return {
    years_observed: withBloom.length,
    earliest_bloom: earliest,
    latest_bloom: latest,
    average_bloom: avgBloom,
    trend,
  };
}

function computeTrend(records: HistoricalRecord[]): string {
  const pre1990 = records.filter(
    (r) => r.year < 1990 && r.bloom_date
  );
  const post1990 = records.filter(
    (r) => r.year >= 1990 && r.bloom_date
  );

  if (pre1990.length < 5 || post1990.length < 5) {
    return "Insufficient data for trend analysis";
  }

  const avgPre = averageDayOfYear(pre1990);
  const avgPost = averageDayOfYear(post1990);
  const diff = avgPre - avgPost;

  if (Math.abs(diff) < 1) {
    return "No significant trend observed";
  }

  const decades = 3.5; // ~1990 to ~2025
  const perDecade = Math.round(diff / decades);

  return diff > 0
    ? `Earlier by ~${perDecade} days per decade since 1990`
    : `Later by ~${Math.abs(perDecade)} days per decade since 1990`;
}

function averageDayOfYear(records: HistoricalRecord[]): number {
  const doys = records
    .filter((r) => r.bloom_date)
    .map((r) => {
      const d = new Date(r.bloom_date!);
      const start = new Date(d.getFullYear(), 0, 0);
      return (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    });
  return doys.reduce((a, b) => a + b, 0) / doys.length;
}

// ── Recommend ──

export interface RecommendInput {
  city?: string;
  region?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getRecommendation(
  db: D1Database,
  input: RecommendInput,
  year: number
) {
  const cityId = input.city ?? "tokyo";
  const meta = LOCATION_BY_ID[cityId];
  if (!meta) return null;

  const forecasts = await getForecastData(db, year, cityId);
  if (forecasts.length === 0) return null;

  const forecast = forecasts[0];
  const fullBloomStart = forecast.estimated_full_bloom_window.earliest;
  const fullBloomEnd = forecast.estimated_full_bloom_window.latest;

  // Calculate overlap with travel dates
  let overlap: string | null = null;
  let likelihood: "high" | "medium" | "low" = "medium";
  let confidence = 0.5;

  if (input.dateFrom && input.dateTo) {
    const travelStart = new Date(input.dateFrom);
    const travelEnd = new Date(input.dateTo);
    const bloomStart = new Date(fullBloomStart);
    const bloomEnd = new Date(fullBloomEnd);

    const overlapStart = new Date(
      Math.max(travelStart.getTime(), bloomStart.getTime())
    );
    const overlapEnd = new Date(
      Math.min(travelEnd.getTime(), bloomEnd.getTime())
    );

    if (overlapStart <= overlapEnd) {
      overlap = `${overlapStart.toISOString().slice(0, 10)}/${overlapEnd.toISOString().slice(0, 10)}`;
      const overlapDays =
        (overlapEnd.getTime() - overlapStart.getTime()) /
        (1000 * 60 * 60 * 24);
      confidence = Math.min(0.95, 0.5 + overlapDays * 0.08);
      likelihood = confidence > 0.7 ? "high" : confidence > 0.4 ? "medium" : "low";
    } else {
      likelihood = "low";
      confidence = 0.2;
    }
  }

  const fullBloomPeriod = `${fullBloomStart}/${fullBloomEnd}`;

  const summary = buildRecommendSummary(
    meta.name_en,
    likelihood,
    forecast.estimated_full_bloom_window.typical
  );

  // Get alternatives from nearby regions
  const alternatives = await getAlternatives(db, cityId, year);

  return {
    likelihood,
    confidence: Math.round(confidence * 100) / 100,
    summary,
    best_days: {
      estimated_full_bloom_period: fullBloomPeriod,
      overlap_with_travel: overlap,
    },
    alternatives,
  };
}

function buildRecommendSummary(
  cityName: string,
  likelihood: string,
  typicalDate: string
): string {
  const monthDay = typicalDate.slice(5);
  const month = parseInt(monthDay.slice(0, 2), 10);
  const monthNames = [
    "", "January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December",
  ];

  const prefix = `${cityName} typically reaches full bloom in ${monthNames[month]}.`;
  const suffix =
    likelihood === "high"
      ? "Your travel dates have a high probability of overlapping with peak cherry blossom viewing."
      : likelihood === "medium"
        ? "Your travel dates may partially overlap with the cherry blossom season."
        : "Your travel dates are unlikely to overlap with peak cherry blossom viewing.";

  return `${prefix} ${suffix}`;
}

async function getAlternatives(
  db: D1Database,
  excludeCity: string,
  year: number
) {
  // Suggest a few popular cities as alternatives
  const altCities = ["tokyo", "kyoto", "osaka", "fukuoka", "sendai"].filter(
    (c) => c !== excludeCity
  );
  const alternatives = [];

  for (const altId of altCities.slice(0, 2)) {
    const altMeta = LOCATION_BY_ID[altId];
    if (!altMeta) continue;

    const altForecasts = await getForecastData(db, year, altId);
    if (altForecasts.length === 0) continue;

    const alt = altForecasts[0];
    alternatives.push({
      city: altId,
      name: altMeta.name_en,
      note: `Blooms around ${alt.estimated_bloom_window.typical.slice(5)}. Consider as alternative.`,
      estimated_full_bloom_period: `${alt.estimated_full_bloom_window.earliest}/${alt.estimated_full_bloom_window.latest}`,
    });
  }

  return alternatives;
}

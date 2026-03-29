import type {
  ColorStatus,
  KouyouStatusSummary,
  KouyouStationStatus,
  KouyouForecastLocation,
  KouyouHistoricalRecord,
  KouyouHistoricalStatistics,
  DateWindow,
} from "../types.js";
import { KOUYOU_LOCATION_BY_ID } from "../data/kouyouLocations.js";
import { toLocationRef } from "../data/locations.js";
import { toMonthDay } from "../scrapers/parser.js";

// ── Status ──

export async function getKouyouStationStatuses(
  db: D1Database,
  year: number,
  region?: string,
  status?: string
): Promise<KouyouStationStatus[]> {
  let query = `
    SELECT ko.*, l.region
    FROM kouyou_observations ko
    JOIN locations l ON ko.location_id = l.id
    WHERE ko.year = ?
  `;
  const params: unknown[] = [year];

  if (region) {
    query += " AND l.region = ?";
    params.push(region);
  }
  if (status) {
    query += " AND ko.color_status = ?";
    params.push(status);
  }

  query += " ORDER BY l.latitude ASC"; // Kouyou goes north to south

  const result = await db
    .prepare(query)
    .bind(...params)
    .all<Record<string, unknown>>();

  return result.results
    .map((row) => {
      const loc = KOUYOU_LOCATION_BY_ID[row.location_id as string];
      if (!loc) return null;

      return {
        location: toLocationRef(loc),
        status: (row.color_status as ColorStatus) ?? "not_yet",
        color_date: row.color_date as string | null,
        fall_date: row.fall_date as string | null,
        normal_color_date: row.normal_color_date as string | null,
        diff_from_normal_days: row.diff_from_normal as number | null,
        tree_species: loc.tree_species,
      };
    })
    .filter(Boolean) as KouyouStationStatus[];
}

export function buildKouyouStatusSummary(
  stations: KouyouStationStatus[]
): KouyouStatusSummary {
  return {
    total_stations: stations.length,
    colored: stations.filter(
      (s) =>
        s.status === "coloring" ||
        s.status === "peak_color" ||
        s.status === "falling" ||
        s.status === "fallen"
    ).length,
    peak_color: stations.filter((s) => s.status === "peak_color").length,
    not_yet: stations.filter((s) => s.status === "not_yet").length,
    fallen: stations.filter((s) => s.status === "fallen").length,
  };
}

// ── Forecast (historical average) ──

export async function getKouyouForecastData(
  db: D1Database,
  year: number,
  city?: string,
  region?: string
): Promise<KouyouForecastLocation[]> {
  let locationFilter = "";
  const params: unknown[] = [];

  if (city) {
    locationFilter = "WHERE id = ?";
    params.push(city);
  } else if (region) {
    locationFilter = "WHERE region = ?";
    params.push(region);
  }

  const minYear = year - 30;
  const locations = await db
    .prepare(
      `SELECT id, region, tree_species FROM locations ${locationFilter} ORDER BY latitude ASC`
    )
    .bind(...params)
    .all<{ id: string; region: string; tree_species: string }>();

  const forecasts: KouyouForecastLocation[] = [];

  for (const loc of locations.results) {
    const meta = KOUYOU_LOCATION_BY_ID[loc.id];
    if (!meta) continue;

    const stats = await db
      .prepare(
        `SELECT color_date, fall_date
         FROM kouyou_observations
         WHERE location_id = ? AND year >= ? AND year < ?
           AND color_date IS NOT NULL`
      )
      .bind(loc.id, minYear, year)
      .all<{ color_date: string; fall_date: string | null }>();

    const colorDates = stats.results
      .map((r) => r.color_date)
      .filter(Boolean)
      .map((d) => toMonthDay(d)!)
      .sort();

    const fallDates = stats.results
      .map((r) => r.fall_date)
      .filter(Boolean)
      .map((d) => toMonthDay(d)!)
      .sort();

    const colorWindow = computeWindow(colorDates, year);
    const fallWindow = computeWindow(fallDates, year);

    const actual = await db
      .prepare(
        `SELECT color_date, fall_date, color_status
         FROM kouyou_observations
         WHERE location_id = ? AND year = ?`
      )
      .bind(loc.id, year)
      .first<{
        color_date: string | null;
        fall_date: string | null;
        color_status: string | null;
      }>();

    forecasts.push({
      location: toLocationRef(meta),
      estimated_color_window: colorWindow,
      estimated_fall_window: fallWindow,
      actual: {
        color_date: actual?.color_date ?? null,
        fall_date: actual?.fall_date ?? null,
        status: (actual?.color_status as ColorStatus) ?? "not_yet",
      },
      based_on_years: colorDates.length,
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
    return { earliest: null, typical: null, latest: null };
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

export async function getKouyouHistoricalRecords(
  db: D1Database,
  city: string,
  fromYear?: number,
  toYear?: number
): Promise<KouyouHistoricalRecord[]> {
  let query = `
    SELECT year, color_date, fall_date,
           diff_from_normal, tree_species
    FROM kouyou_observations
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
    color_date: row.color_date as string | null,
    fall_date: row.fall_date as string | null,
    diff_from_normal_days: row.diff_from_normal as number | null,
    tree_species: (row.tree_species as string) ?? "iroha_kaede",
  }));
}

export function computeKouyouStatistics(
  records: KouyouHistoricalRecord[]
): KouyouHistoricalStatistics {
  const withColor = records.filter((r) => r.color_date);

  if (withColor.length === 0) {
    return {
      years_observed: 0,
      earliest_color: null,
      latest_color: null,
      average_color: null,
      trend: "Insufficient data",
    };
  }

  let earliest = { date: "12-31", year: 0 };
  let latest = { date: "01-01", year: 0 };
  let totalDayOfYear = 0;

  for (const rec of withColor) {
    const md = toMonthDay(rec.color_date!)!;
    if (md < earliest.date) {
      earliest = { date: md, year: rec.year };
    }
    if (md > latest.date) {
      latest = { date: md, year: rec.year };
    }
    const month = parseInt(md.slice(0, 2), 10);
    const day = parseInt(md.slice(3, 5), 10);
    totalDayOfYear += (month - 1) * 30 + day;
  }

  const avgDay = Math.round(totalDayOfYear / withColor.length);
  const avgMonth = Math.floor(avgDay / 30) + 1;
  const avgDayOfMonth = avgDay % 30 || 1;
  const avgColor = `${String(avgMonth).padStart(2, "0")}-${String(avgDayOfMonth).padStart(2, "0")}`;

  const trend = computeKouyouTrend(withColor);

  return {
    years_observed: withColor.length,
    earliest_color: earliest,
    latest_color: latest,
    average_color: avgColor,
    trend,
  };
}

function computeKouyouTrend(records: KouyouHistoricalRecord[]): string {
  const pre1990 = records.filter(
    (r) => r.year < 1990 && r.color_date
  );
  const post1990 = records.filter(
    (r) => r.year >= 1990 && r.color_date
  );

  if (pre1990.length < 5 || post1990.length < 5) {
    return "Insufficient data for trend analysis";
  }

  const avgPre = averageDayOfYear(pre1990);
  const avgPost = averageDayOfYear(post1990);
  const diff = avgPost - avgPre; // For kouyou, later = delayed

  if (Math.abs(diff) < 1) {
    return "No significant trend observed";
  }

  const decades = 3.5;
  const perDecade = Math.round(diff / decades);

  return diff > 0
    ? `Later by ~${perDecade} days per decade since 1990`
    : `Earlier by ~${Math.abs(perDecade)} days per decade since 1990`;
}

function averageDayOfYear(records: KouyouHistoricalRecord[]): number {
  const doys = records
    .filter((r) => r.color_date)
    .map((r) => {
      const d = new Date(r.color_date!);
      const start = new Date(d.getFullYear(), 0, 0);
      return (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    });
  return doys.reduce((a, b) => a + b, 0) / doys.length;
}

// ── Recommend ──

export interface KouyouRecommendInput {
  city?: string;
  region?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getKouyouRecommendation(
  db: D1Database,
  input: KouyouRecommendInput,
  year: number
) {
  const cityId = input.city ?? "kyoto"; // Default to Kyoto for kouyou
  const meta = KOUYOU_LOCATION_BY_ID[cityId];
  if (!meta) return null;

  const forecasts = await getKouyouForecastData(db, year, cityId);
  if (forecasts.length === 0) return null;

  const forecast = forecasts[0];
  const peakColorStart = forecast.estimated_color_window.earliest;
  const peakColorEnd = forecast.estimated_color_window.latest;

  if (!peakColorStart || !peakColorEnd) return null;

  let overlap: string | null = null;
  let likelihood: "high" | "medium" | "low" = "medium";
  let confidence = 0.5;

  if (input.dateFrom && input.dateTo) {
    const travelStart = new Date(input.dateFrom);
    const travelEnd = new Date(input.dateTo);
    const colorStart = new Date(peakColorStart);
    const colorEnd = new Date(peakColorEnd);

    const overlapStart = new Date(
      Math.max(travelStart.getTime(), colorStart.getTime())
    );
    const overlapEnd = new Date(
      Math.min(travelEnd.getTime(), colorEnd.getTime())
    );

    if (overlapStart <= overlapEnd) {
      overlap = `${overlapStart.toISOString().slice(0, 10)}/${overlapEnd.toISOString().slice(0, 10)}`;
      const overlapDays =
        (overlapEnd.getTime() - overlapStart.getTime()) /
        (1000 * 60 * 60 * 24);
      confidence = Math.min(0.95, 0.5 + overlapDays * 0.08);
      likelihood =
        confidence > 0.7 ? "high" : confidence > 0.4 ? "medium" : "low";
    } else {
      likelihood = "low";
      confidence = 0.2;
    }
  }

  const peakColorPeriod = `${peakColorStart}/${peakColorEnd}`;

  const typicalDate = forecast.estimated_color_window.typical;
  const summary = buildKouyouRecommendSummary(
    meta.name_en,
    likelihood,
    typicalDate ?? peakColorStart
  );

  const alternatives = await getKouyouAlternatives(db, cityId, year);

  return {
    likelihood,
    confidence: Math.round(confidence * 100) / 100,
    summary,
    best_days: {
      estimated_peak_color_period: peakColorPeriod,
      overlap_with_travel: overlap,
    },
    alternatives,
  };
}

function buildKouyouRecommendSummary(
  cityName: string,
  likelihood: string,
  typicalDate: string
): string {
  const monthDay = typicalDate.slice(5);
  const month = parseInt(monthDay.slice(0, 2), 10);
  const monthNames = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prefix = `${cityName} typically reaches peak autumn color in ${monthNames[month]}.`;
  const suffix =
    likelihood === "high"
      ? "Your travel dates have a high probability of overlapping with peak autumn foliage viewing."
      : likelihood === "medium"
        ? "Your travel dates may partially overlap with the autumn foliage season."
        : "Your travel dates are unlikely to overlap with peak autumn foliage viewing.";

  return `${prefix} ${suffix}`;
}

async function getKouyouAlternatives(
  db: D1Database,
  excludeCity: string,
  year: number
) {
  const altCities = ["kyoto", "tokyo", "nikko", "osaka", "sendai"].filter(
    (c) => c !== excludeCity
  );
  const alternatives = [];

  for (const altId of altCities.slice(0, 2)) {
    const altMeta = KOUYOU_LOCATION_BY_ID[altId];
    if (!altMeta) continue;

    const altForecasts = await getKouyouForecastData(db, year, altId);
    if (altForecasts.length === 0) continue;

    const alt = altForecasts[0];
    const typicalColor = alt.estimated_color_window.typical;
    if (!typicalColor) continue;

    alternatives.push({
      city: altId,
      name: altMeta.name_en,
      note: `Peak color around ${typicalColor.slice(5)}. Consider as alternative.`,
      estimated_peak_color_period: `${alt.estimated_color_window.earliest ?? "unknown"}/${alt.estimated_color_window.latest ?? "unknown"}`,
    });
  }

  return alternatives;
}

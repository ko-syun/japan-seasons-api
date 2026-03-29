import type { Env } from "../types.js";

// ── Types ──

export interface MatsuriRow {
  id: string;
  name_en: string;
  name_ja: string;
  city: string;
  prefecture: string;
  region: string;
  month: number;
  date_start: string | null;
  date_end: string | null;
  highlight_dates: string | null;
  category: string;
  description_en: string | null;
  description_ja: string | null;
  estimated_visitors: number | null;
  access: string | null;
  latitude: number | null;
  longitude: number | null;
  tips_en: string | null;
  official_url: string | null;
  is_active: number;
  updated_at: string;
}

export interface MatsuriResponse {
  id: string;
  name_en: string;
  name_ja: string;
  city: string;
  prefecture: string;
  region: string;
  month: number;
  date_start: string | null;
  date_end: string | null;
  highlight_dates: string[];
  category: string[];
  description_en: string | null;
  description_ja: string | null;
  estimated_visitors: number | null;
  access: string | null;
  latitude: number | null;
  longitude: number | null;
  tips_en: string | null;
  official_url: string | null;
}

// ── Helpers ──

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toMatsuriResponse(row: MatsuriRow): MatsuriResponse {
  return {
    id: row.id,
    name_en: row.name_en,
    name_ja: row.name_ja,
    city: row.city,
    prefecture: row.prefecture,
    region: row.region,
    month: row.month,
    date_start: row.date_start,
    date_end: row.date_end,
    highlight_dates: parseJsonArray(row.highlight_dates),
    category: parseJsonArray(row.category),
    description_en: row.description_en,
    description_ja: row.description_ja,
    estimated_visitors: row.estimated_visitors,
    access: row.access,
    latitude: row.latitude,
    longitude: row.longitude,
    tips_en: row.tips_en,
    official_url: row.official_url,
  };
}

// ── Search ──

export interface SearchParams {
  region?: string;
  month?: number;
  city?: string;
  category?: string;
  limit: number;
  offset: number;
}

export async function searchMatsuri(
  db: D1Database,
  params: SearchParams
): Promise<{ results: MatsuriResponse[]; total: number }> {
  const conditions: string[] = ["is_active = 1"];
  const binds: unknown[] = [];

  if (params.region) {
    conditions.push("region = ?");
    binds.push(params.region);
  }
  if (params.month) {
    conditions.push("month = ?");
    binds.push(params.month);
  }
  if (params.city) {
    conditions.push("(city LIKE ? OR prefecture LIKE ?)");
    binds.push(`%${params.city}%`, `%${params.city}%`);
  }
  if (params.category) {
    conditions.push("category LIKE ?");
    binds.push(`%"${params.category}"%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count query
  const countResult = await db
    .prepare(`SELECT COUNT(*) as cnt FROM matsuri ${where}`)
    .bind(...binds)
    .first<{ cnt: number }>();
  const total = countResult?.cnt ?? 0;

  // Data query
  const dataResult = await db
    .prepare(
      `SELECT * FROM matsuri ${where} ORDER BY month, date_start LIMIT ? OFFSET ?`
    )
    .bind(...binds, params.limit, params.offset)
    .all<MatsuriRow>();

  return {
    results: dataResult.results.map(toMatsuriResponse),
    total,
  };
}

// ── Upcoming ──

export interface UpcomingParams {
  days: number;
  region?: string;
  limit: number;
}

export async function getUpcomingMatsuri(
  db: D1Database,
  params: UpcomingParams
): Promise<MatsuriResponse[]> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  const currentDay = now.getDate();
  const currentMmDd = `${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;

  const endDate = new Date(now.getTime() + params.days * 24 * 60 * 60 * 1000);
  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();
  const endMmDd = `${String(endMonth).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

  const conditions: string[] = ["is_active = 1"];
  const binds: unknown[] = [];

  // Handle year-boundary wrap (e.g., looking from Dec into Jan)
  if (currentMmDd <= endMmDd) {
    // Same year range
    conditions.push(
      "((date_start IS NOT NULL AND date_start <= ? AND date_end >= ?) OR (date_start IS NOT NULL AND date_start >= ? AND date_start <= ?))"
    );
    binds.push(endMmDd, currentMmDd, currentMmDd, endMmDd);
  } else {
    // Wraps around year boundary
    conditions.push(
      "((date_start IS NOT NULL AND (date_start >= ? OR date_start <= ?)) OR (date_end IS NOT NULL AND (date_end >= ? OR date_end <= ?)))"
    );
    binds.push(currentMmDd, endMmDd, currentMmDd, endMmDd);
  }

  if (params.region) {
    conditions.push("region = ?");
    binds.push(params.region);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const result = await db
    .prepare(`SELECT * FROM matsuri ${where} ORDER BY date_start LIMIT ?`)
    .bind(...binds, params.limit)
    .all<MatsuriRow>();

  return result.results.map(toMatsuriResponse);
}

// ── Get by ID ──

export async function getMatsuriById(
  db: D1Database,
  id: string
): Promise<MatsuriResponse | null> {
  const row = await db
    .prepare("SELECT * FROM matsuri WHERE id = ? AND is_active = 1")
    .bind(id)
    .first<MatsuriRow>();

  if (!row) return null;
  return toMatsuriResponse(row);
}

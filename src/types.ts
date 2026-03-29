// ── Environment Bindings ──

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ENVIRONMENT: string;
}

// ── Location Types ──

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationMeta {
  id: string;
  name_en: string;
  name_ja: string;
  prefecture_en: string;
  prefecture_ja: string;
  region: string;
  lat: number;
  lon: number;
  tree_species: string;
}

export interface LocationResponse {
  id: string;
  name: string;
  name_ja: string;
  prefecture: string;
  prefecture_ja: string;
  region: string;
  coordinates: Coordinates;
  tree_species: string;
  observation_years: { from: number; to: number };
}

export interface LocationRef {
  id: string;
  name: string;
  prefecture: string;
  region: string;
  coordinates: Coordinates;
}

// ── Bloom Status ──

export type BloomStatus =
  | "not_yet"
  | "budding"
  | "blooming"
  | "full_bloom"
  | "falling"
  | "ended";

// ── Observation ──

export interface SakuraObservation {
  id: number;
  location_id: string;
  year: number;
  bloom_date: string | null;
  full_bloom_date: string | null;
  bloom_status: BloomStatus | null;
  normal_bloom_date: string | null;
  normal_full_bloom_date: string | null;
  diff_from_normal: number | null;
  tree_species: string;
  source: string;
  updated_at: string;
}

// ── Status Endpoint ──

export interface StatusSummary {
  total_stations: number;
  bloomed: number;
  full_bloom: number;
  not_yet: number;
  ended: number;
}

export interface StationStatus {
  location: LocationRef;
  status: BloomStatus;
  bloom_date: string | null;
  full_bloom_date: string | null;
  normal_bloom_date: string | null;
  diff_from_normal_days: number | null;
  tree_species: string;
}

export interface StatusResponse {
  data: {
    season: number;
    summary: StatusSummary;
    stations: StationStatus[];
  };
  meta: {
    source: string;
    updated_at: string;
    attribution: string;
  };
}

// ── Forecast Endpoint ──

export interface DateWindow {
  earliest: string;
  typical: string;
  latest: string;
}

export interface ForecastLocation {
  location: LocationRef;
  estimated_bloom_window: DateWindow;
  estimated_full_bloom_window: DateWindow;
  actual: {
    bloom_date: string | null;
    full_bloom_date: string | null;
    status: BloomStatus;
  };
  based_on_years: number;
  tree_species: string;
}

export interface ForecastResponse {
  data: {
    season: number;
    note: string;
    locations: ForecastLocation[];
  };
  meta: {
    source: string;
    method: string;
    attribution: string;
  };
}

// ── Historical Endpoint ──

export interface HistoricalRecord {
  year: number;
  bloom_date: string | null;
  full_bloom_date: string | null;
  diff_from_normal_days: number | null;
  tree_species: string;
}

export interface HistoricalStatistics {
  years_observed: number;
  earliest_bloom: { date: string; year: number } | null;
  latest_bloom: { date: string; year: number } | null;
  average_bloom: string | null;
  trend: string;
}

export interface HistoricalResponse {
  data: {
    location: LocationRef;
    records: HistoricalRecord[];
    statistics: HistoricalStatistics;
  };
  meta: {
    source: string;
    attribution: string;
  };
}

// ── Locations Endpoint ──

export interface LocationsResponse {
  data: LocationResponse[];
  meta: {
    total: number;
  };
}

// ── Recommend Endpoint ──

export interface RecommendAlternative {
  city: string;
  name: string;
  note: string;
  estimated_full_bloom_period: string;
}

export interface RecommendResponse {
  data: {
    query: {
      city: string | null;
      region: string | null;
      dates: string | null;
    };
    recommendation: {
      likelihood: "high" | "medium" | "low";
      confidence: number;
      summary: string;
      best_days: {
        estimated_full_bloom_period: string;
        overlap_with_travel: string | null;
      };
      alternatives: RecommendAlternative[];
    };
  };
  meta: {
    method: string;
    disclaimer: string;
  };
}

// ── API Key ──

export interface ApiKey {
  key_hash: string;
  tier: "free" | "pro" | "enterprise";
  owner_email: string | null;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

// ── Scraper Types ──

export interface ScrapedObservation {
  location_ja: string;
  year: number;
  month: number | null;
  day: number | null;
}

export interface ParsedBloomData {
  location_id: string;
  year: number;
  bloom_date: string | null;
  full_bloom_date: string | null;
}

// ── Error ──

export interface ApiError {
  error: {
    code: string;
    message: string;
    upgrade_url?: string;
  };
}

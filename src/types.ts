// ── Environment Bindings ──

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PAYG_PRICE_ID?: string;
  JWT_SECRET?: string;
  X402_PAYTO_ADDRESS?: string;
  DISCORD_WEBHOOK_URL?: string;
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
  earliest: string | null;
  typical: string | null;
  latest: string | null;
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

// ── Kouyou (Autumn Foliage) Types ──

export type ColorStatus =
  | "not_yet"
  | "coloring"
  | "peak_color"
  | "falling"
  | "fallen";

export interface KouyouObservation {
  id: number;
  location_id: string;
  year: number;
  color_date: string | null;
  fall_date: string | null;
  color_status: ColorStatus | null;
  normal_color_date: string | null;
  normal_fall_date: string | null;
  diff_from_normal: number | null;
  tree_species: string;
  source: string;
  updated_at: string;
}

export interface KouyouStatusSummary {
  total_stations: number;
  colored: number;
  peak_color: number;
  not_yet: number;
  fallen: number;
}

export interface KouyouStationStatus {
  location: LocationRef;
  status: ColorStatus;
  color_date: string | null;
  fall_date: string | null;
  normal_color_date: string | null;
  diff_from_normal_days: number | null;
  tree_species: string;
}

export interface KouyouStatusResponse {
  data: {
    season: number;
    summary: KouyouStatusSummary;
    stations: KouyouStationStatus[];
  };
  meta: {
    source: string;
    updated_at: string;
    attribution: string;
  };
}

export interface KouyouForecastLocation {
  location: LocationRef;
  estimated_color_window: DateWindow;
  estimated_fall_window: DateWindow;
  actual: {
    color_date: string | null;
    fall_date: string | null;
    status: ColorStatus;
  };
  based_on_years: number;
  tree_species: string;
}

export interface KouyouForecastResponse {
  data: {
    season: number;
    note: string;
    locations: KouyouForecastLocation[];
  };
  meta: {
    source: string;
    method: string;
    attribution: string;
  };
}

export interface KouyouHistoricalRecord {
  year: number;
  color_date: string | null;
  fall_date: string | null;
  diff_from_normal_days: number | null;
  tree_species: string;
}

export interface KouyouHistoricalStatistics {
  years_observed: number;
  earliest_color: { date: string; year: number } | null;
  latest_color: { date: string; year: number } | null;
  average_color: string | null;
  trend: string;
}

export interface KouyouHistoricalResponse {
  data: {
    location: LocationRef;
    records: KouyouHistoricalRecord[];
    statistics: KouyouHistoricalStatistics;
  };
  meta: {
    source: string;
    attribution: string;
  };
}

export interface KouyouRecommendResponse {
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
        estimated_peak_color_period: string;
        overlap_with_travel: string | null;
      };
      alternatives: KouyouRecommendAlternative[];
    };
  };
  meta: {
    method: string;
    disclaimer: string;
  };
}

export interface KouyouRecommendAlternative {
  city: string;
  name: string;
  note: string;
  estimated_peak_color_period: string;
}

// ── Error ──

export interface ApiError {
  error: {
    code: string;
    message: string;
    upgrade_url?: string;
  };
}

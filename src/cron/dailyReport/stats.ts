import type { Env } from "../../types.js";

export interface DailyStats {
  date: string;
  totalRequests: number;
  endpointBreakdown: { endpoint: string; count: number }[];
  tierBreakdown: { tier: string; count: number }[];
  error4xx: number;
  error5xx: number;
  rateLimited: number;
  x402Payments: { count: number; totalUsdc: number };
  activeUsers: number;
}

interface D1DailyStats {
  date: string;
  endpoint: string;
  tier: string;
  request_count: number;
  error_4xx: number;
  error_5xx: number;
  rate_limited: number;
}

interface X402PaymentSummary {
  count: number;
  total_base_units: number;
}

interface ActiveUserCount {
  count: number;
}

export async function collectDailyStats(env: Env, date: string): Promise<DailyStats> {
  const dailyStats = await fetchDailyStats(env, date);
  const aggregates = aggregateStats(dailyStats);
  const x402 = await fetchX402Payments(env, date);
  const activeUsers = await fetchActiveUsers(env, date);

  return {
    date,
    totalRequests: aggregates.totalRequests,
    endpointBreakdown: aggregates.endpointBreakdown,
    tierBreakdown: aggregates.tierBreakdown,
    error4xx: aggregates.error4xx,
    error5xx: aggregates.error5xx,
    rateLimited: aggregates.rateLimited,
    x402Payments: x402,
    activeUsers,
  };
}

async function fetchDailyStats(env: Env, date: string): Promise<D1DailyStats[]> {
  const { results } = await env.DB.prepare(
    `SELECT date, endpoint, tier, request_count, error_4xx, error_5xx, rate_limited
     FROM daily_request_stats WHERE date = ?`
  ).bind(date).all<D1DailyStats>();
  return results ?? [];
}

function aggregateStats(rows: D1DailyStats[]): {
  totalRequests: number;
  error4xx: number;
  error5xx: number;
  rateLimited: number;
  endpointBreakdown: { endpoint: string; count: number }[];
  tierBreakdown: { tier: string; count: number }[];
} {
  let totalRequests = 0;
  let error4xx = 0;
  let error5xx = 0;
  let rateLimited = 0;
  const endpointMap = new Map<string, number>();
  const tierMap = new Map<string, number>();

  for (const row of rows) {
    totalRequests += row.request_count;
    error4xx += row.error_4xx;
    error5xx += row.error_5xx;
    rateLimited += row.rate_limited;

    endpointMap.set(row.endpoint, (endpointMap.get(row.endpoint) ?? 0) + row.request_count);
    tierMap.set(row.tier, (tierMap.get(row.tier) ?? 0) + row.request_count);
  }

  return {
    totalRequests,
    error4xx,
    error5xx,
    rateLimited,
    endpointBreakdown: sortAndLimitEndpoints(endpointMap, 10),
    tierBreakdown: sortAndLimitTiers(tierMap, 5),
  };
}

function sortAndLimitEndpoints(map: Map<string, number>, limit: number): { endpoint: string; count: number }[] {
  return Array.from(map.entries())
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function sortAndLimitTiers(map: Map<string, number>, limit: number): { tier: string; count: number }[] {
  return Array.from(map.entries())
    .map(([tier, count]) => ({ tier, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

async function fetchX402Payments(env: Env, date: string): Promise<{ count: number; totalUsdc: number }> {
  const { results } = await env.DB.prepare(
    `SELECT COUNT(*) as count, COALESCE(SUM(amount_base_units), 0) as total_base_units
     FROM x402_payments WHERE DATE(settled_at) = ?`
  ).bind(date).all<X402PaymentSummary>();

  const summary = results[0] ?? { count: 0, total_base_units: 0 };
  return {
    count: summary.count,
    totalUsdc: summary.total_base_units / 1_000_000,
  };
}

async function fetchActiveUsers(env: Env, date: string): Promise<number> {
  const { results } = await env.DB.prepare(
    `SELECT COUNT(DISTINCT key_hash) as count FROM daily_request_stats WHERE date = ?`
  ).bind(date).all<ActiveUserCount>();
  return results[0]?.count ?? 0;
}

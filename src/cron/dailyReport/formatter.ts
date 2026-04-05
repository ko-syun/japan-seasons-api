import type { DailyStats } from "./stats.js";

export function formatDiscordMessage(stats: DailyStats): string {
  const dateFmt = new Date(stats.date).toLocaleDateString("ja-JP");

  return [
    `📊 Japan Seasons API Daily Report — ${dateFmt}`,
    "",
    formatAccessSection(stats),
    formatErrorSection(stats),
    formatTierSection(stats),
    formatEndpointSection(stats),
    formatX402Section(stats),
  ].join("\n");
}

function formatAccessSection(stats: DailyStats): string {
  return [
    `**アクセス**`,
    `- 総リクエスト: ${stats.totalRequests.toLocaleString()}`,
    `- アクティブユーザ: ${stats.activeUsers.toLocaleString()}`,
    `- レートリミット到達: ${stats.rateLimited.toLocaleString()}`,
    "",
  ].join("\n");
}

function formatErrorSection(stats: DailyStats): string {
  const errorRate = stats.totalRequests > 0
    ? ((stats.error4xx + stats.error5xx) / stats.totalRequests * 100).toFixed(2)
    : "0.00";

  return [
    `**エラー**`,
    `- 4xx: ${stats.error4xx.toLocaleString()}`,
    `- 5xx: ${stats.error5xx.toLocaleString()}`,
    `- エラー率: ${errorRate}%`,
    "",
  ].join("\n");
}

function formatTierSection(stats: DailyStats): string {
  const lines = stats.tierBreakdown
    .map(t => `  - ${t.tier}: ${t.count.toLocaleString()}`)
    .join("\n");

  return [
    `**tier別リクエスト**`,
    lines || "  - (データなし)",
    "",
  ].join("\n");
}

function formatEndpointSection(stats: DailyStats): string {
  const lines = stats.endpointBreakdown
    .slice(0, 5)
    .map(e => `  - ${e.endpoint}: ${e.count.toLocaleString()}`)
    .join("\n");

  return [
    `**TOP 5 エンドポイント**`,
    lines || "  - (データなし)",
    "",
  ].join("\n");
}

function formatX402Section(stats: DailyStats): string {
  return [
    `**x402収入**`,
    `- 決済件数: ${stats.x402Payments.count}`,
    `- USDC収入: ${stats.x402Payments.totalUsdc.toFixed(6)}`,
  ].join("\n");
}

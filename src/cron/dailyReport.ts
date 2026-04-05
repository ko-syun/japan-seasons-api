import type { Env } from "../types.js";
import { collectDailyStats } from "./dailyReport/stats.js";
import { formatDiscordMessage } from "./dailyReport/formatter.js";
import { sendToDiscord } from "./dailyReport/sender.js";

/**
 * Daily report cron: generates and sends report to Discord.
 * Runs at 00:34 UTC (09:34 JST).
 */
export async function handleDailyReportCron(env: Env): Promise<void> {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const stats = await collectDailyStats(env, dateStr);
  const message = formatDiscordMessage(stats);

  if (env.DISCORD_WEBHOOK_URL) {
    await sendToDiscord(env.DISCORD_WEBHOOK_URL, message);
  } else {
    console.log("DISCORD_WEBHOOK_URL not set. Daily report:");
    console.log(message);
  }
}

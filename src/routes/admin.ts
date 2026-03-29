import { Hono } from "hono";
import type { Env } from "../types.js";
import { importHistoricalData } from "../scripts/importHistorical.js";
import { handleScheduled } from "../cron/ingest.js";

/**
 * Temporary admin routes for data import.
 * Remove after initial data load.
 */
const adminRoute = new Hono<{ Bindings: Env }>();

adminRoute.get("/import-historical", async (c) => {
  const secret = c.req.query("secret");
  if (secret !== "sakura-import-2026") {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const stats = await importHistoricalData(c.env);
  return c.json({ status: "done", stats });
});

adminRoute.get("/trigger-cron", async (c) => {
  const secret = c.req.query("secret");
  if (secret !== "sakura-import-2026") {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Create a minimal ExecutionContext for the cron handler
  const ctx = {
    waitUntil: (p: Promise<unknown>) => { p.catch(() => {}); },
    passThroughOnException: () => {},
    props: {},
  } as unknown as ExecutionContext;

  await handleScheduled({} as ScheduledEvent, c.env, ctx);
  return c.json({ status: "done", message: "Cron triggered" });
});

export { adminRoute };

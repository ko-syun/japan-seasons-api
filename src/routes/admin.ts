import { Hono } from "hono";
import type { Env } from "../types.js";
import { importHistoricalData } from "../scripts/importHistorical.js";
import { handleScheduled } from "../cron/ingest.js";

/**
 * Temporary admin routes for data import.
 * Auth via JWT_SECRET (reuse existing secret as admin token).
 * Remove after initial data load.
 */
const adminRoute = new Hono<{ Bindings: Env }>();

function verifyAdminSecret(c: { req: { query: (k: string) => string | undefined }; env: Env }): boolean {
  const secret = c.req.query("secret");
  const adminSecret = c.env.JWT_SECRET;
  if (!secret || !adminSecret) return false;
  // Use JWT_SECRET as admin auth token
  if (secret.length !== adminSecret.length) return false;
  let result = 0;
  for (let i = 0; i < secret.length; i++) {
    result |= secret.charCodeAt(i) ^ adminSecret.charCodeAt(i);
  }
  return result === 0;
}

adminRoute.get("/import-historical", async (c) => {
  if (!verifyAdminSecret(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const stats = await importHistoricalData(c.env);
  return c.json({ status: "done", stats });
});

adminRoute.get("/trigger-cron", async (c) => {
  if (!verifyAdminSecret(c)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const ctx = {
    waitUntil: (p: Promise<unknown>) => { p.catch(() => {}); },
    passThroughOnException: () => {},
    props: {},
  } as unknown as ExecutionContext;

  await handleScheduled({} as ScheduledEvent, c.env, ctx);
  return c.json({ status: "done", message: "Cron triggered" });
});

export { adminRoute };

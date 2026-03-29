import { Hono } from "hono";
import type { Env, StatusResponse } from "../types.js";
import {
  getStationStatuses,
  buildStatusSummary,
} from "../services/sakuraService.js";
import { getCached, setCache, CACHE_KEYS, TTL } from "../services/cacheService.js";

const statusRoute = new Hono<{ Bindings: Env }>();

statusRoute.get("/", async (c) => {
  const region = c.req.query("region");
  const status = c.req.query("status");
  const yearParam = c.req.query("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  // Cache only for current year without filters
  const cacheKey = !region && !status && !yearParam ? CACHE_KEYS.status : null;
  if (cacheKey) {
    const cached = await getCached<StatusResponse>(c.env.KV, cacheKey);
    if (cached) return c.json(cached);
  }

  const stations = await getStationStatuses(c.env.DB, year, region, status);
  const summary = buildStatusSummary(stations);

  const response: StatusResponse = {
    data: {
      season: year,
      summary,
      stations,
    },
    meta: {
      source: "jma",
      updated_at: new Date().toISOString(),
      attribution:
        "Data sourced from Japan Meteorological Agency (気象庁)",
    },
  };

  if (cacheKey) {
    c.executionCtx.waitUntil(
      setCache(c.env.KV, cacheKey, response, TTL.status)
    );
  }

  return c.json(response);
});

export { statusRoute };

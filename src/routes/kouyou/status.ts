import { Hono } from "hono";
import type { Env, KouyouStatusResponse } from "../../types.js";
import {
  getKouyouStationStatuses,
  buildKouyouStatusSummary,
} from "../../services/kouyouService.js";
import { getCached, setCache, KOUYOU_CACHE_KEYS, TTL } from "../../services/cacheService.js";
import { safeWaitUntil } from "../../utils/waitUntil.js";
import { parseYear } from "../../utils/params.js";

const kouyouStatusRoute = new Hono<{ Bindings: Env }>();

kouyouStatusRoute.get("/", async (c) => {
  const region = c.req.query("region");
  const status = c.req.query("status");
  const yearParam = c.req.query("year");
  const year = parseYear(yearParam) ?? new Date().getFullYear();

  const cacheKey =
    !region && !status && !yearParam ? KOUYOU_CACHE_KEYS.status : null;
  if (cacheKey) {
    const cached = await getCached<KouyouStatusResponse>(c.env.KV, cacheKey);
    if (cached) return c.json(cached);
  }

  const stations = await getKouyouStationStatuses(
    c.env.DB,
    year,
    region,
    status
  );
  const summary = buildKouyouStatusSummary(stations);

  const response: KouyouStatusResponse = {
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
    safeWaitUntil(c, setCache(c.env.KV, cacheKey, response, TTL.status));
  }

  return c.json(response);
});

export { kouyouStatusRoute };

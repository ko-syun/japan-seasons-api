import { Hono } from "hono";
import type { Env, KouyouForecastResponse } from "../../types.js";
import { getKouyouForecastData } from "../../services/kouyouService.js";
import { getCached, setCache, KOUYOU_CACHE_KEYS, TTL } from "../../services/cacheService.js";
import { safeWaitUntil } from "../../utils/waitUntil.js";

const kouyouForecastRoute = new Hono<{ Bindings: Env }>();

kouyouForecastRoute.get("/", async (c) => {
  const city = c.req.query("city");
  const region = c.req.query("region");
  const year = new Date().getFullYear();

  const cacheKey =
    !city && !region ? KOUYOU_CACHE_KEYS.forecast : null;
  if (cacheKey) {
    const cached = await getCached<KouyouForecastResponse>(c.env.KV, cacheKey);
    if (cached) return c.json(cached);
  }

  const locations = await getKouyouForecastData(c.env.DB, year, city, region);

  const response: KouyouForecastResponse = {
    data: {
      season: year,
      note: "Dates are historical averages. Actual dates vary by ±7 days depending on weather.",
      locations,
    },
    meta: {
      source: "jma_historical",
      method: "30-year average with min/max range",
      attribution:
        "Based on historical data from Japan Meteorological Agency (気象庁)",
    },
  };

  if (cacheKey) {
    safeWaitUntil(c, setCache(c.env.KV, cacheKey, response, TTL.forecast));
  }

  return c.json(response);
});

export { kouyouForecastRoute };

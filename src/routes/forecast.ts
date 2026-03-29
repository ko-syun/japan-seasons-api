import { Hono } from "hono";
import type { Env, ForecastResponse } from "../types.js";
import { getForecastData } from "../services/sakuraService.js";
import { getCached, setCache, CACHE_KEYS, TTL } from "../services/cacheService.js";
import { safeWaitUntil } from "../utils/waitUntil.js";

const forecastRoute = new Hono<{ Bindings: Env }>();

forecastRoute.get("/", async (c) => {
  const city = c.req.query("city");
  const region = c.req.query("region");
  const year = new Date().getFullYear();

  // Cache only for no-filter requests
  const cacheKey = !city && !region ? CACHE_KEYS.forecast : null;
  if (cacheKey) {
    const cached = await getCached<ForecastResponse>(c.env.KV, cacheKey);
    if (cached) return c.json(cached);
  }

  const locations = await getForecastData(c.env.DB, year, city, region);

  const response: ForecastResponse = {
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

export { forecastRoute };

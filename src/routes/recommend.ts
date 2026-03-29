import { Hono } from "hono";
import type { Env, RecommendResponse } from "../types.js";
import { LOCATION_BY_ID } from "../data/locations.js";
import { getRecommendation } from "../services/sakuraService.js";

const recommendRoute = new Hono<{ Bindings: Env }>();

recommendRoute.get("/", async (c) => {
  const city = c.req.query("city");
  const region = c.req.query("region");
  const dates = c.req.query("dates");
  const year = new Date().getFullYear();

  if (city && !LOCATION_BY_ID[city]) {
    return c.json(
      {
        error: {
          code: "INVALID_CITY",
          message: `Unknown city: ${city}. Use GET /v1/sakura/locations for valid IDs.`,
        },
      },
      404
    );
  }

  // Parse date range "2026-03-25/2026-04-05"
  let dateFrom: string | undefined;
  let dateTo: string | undefined;
  if (dates) {
    const parts = dates.split("/");
    if (parts.length === 2) {
      dateFrom = parts[0];
      dateTo = parts[1];
    }
  }

  const recommendation = await getRecommendation(
    c.env.DB,
    { city: city ?? undefined, region: region ?? undefined, dateFrom, dateTo },
    year
  );

  if (!recommendation) {
    return c.json(
      {
        error: {
          code: "NO_DATA",
          message: "No recommendation data available for the specified parameters.",
        },
      },
      404
    );
  }

  const response: RecommendResponse = {
    data: {
      query: {
        city: city ?? null,
        region: region ?? null,
        dates: dates ?? null,
      },
      recommendation,
    },
    meta: {
      method: "Historical average analysis (30-year window)",
      disclaimer:
        "Recommendations based on historical patterns. Actual dates vary with weather conditions.",
    },
  };

  return c.json(response);
});

export { recommendRoute };

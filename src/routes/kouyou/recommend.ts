import { Hono } from "hono";
import type { Env, KouyouRecommendResponse } from "../../types.js";
import { KOUYOU_LOCATION_BY_ID } from "../../data/kouyouLocations.js";
import { getKouyouRecommendation } from "../../services/kouyouService.js";
import { parseDateRange } from "../../utils/params.js";

const kouyouRecommendRoute = new Hono<{ Bindings: Env }>();

kouyouRecommendRoute.get("/", async (c) => {
  const city = c.req.query("city");
  const region = c.req.query("region");
  const dates = c.req.query("dates");
  const year = new Date().getFullYear();

  if (city && !KOUYOU_LOCATION_BY_ID[city]) {
    return c.json(
      {
        error: {
          code: "INVALID_CITY",
          message: `Unknown city: ${city}. Use GET /v1/kouyou/locations for valid IDs.`,
        },
      },
      404
    );
  }

  let dateFrom: string | undefined;
  let dateTo: string | undefined;
  if (dates) {
    const range = parseDateRange(dates);
    if (!range) {
      return c.json(
        {
          error: {
            code: "INVALID_DATE_FORMAT",
            message:
              "Expected format: YYYY-MM-DD/YYYY-MM-DD. Example: ?dates=2026-11-10/2026-11-25",
          },
        },
        400
      );
    }
    [dateFrom, dateTo] = range;
  }

  const recommendation = await getKouyouRecommendation(
    c.env.DB,
    {
      city: city ?? undefined,
      region: region ?? undefined,
      dateFrom,
      dateTo,
    },
    year
  );

  if (!recommendation) {
    return c.json(
      {
        error: {
          code: "NO_DATA",
          message:
            "No recommendation data available for the specified parameters.",
        },
      },
      404
    );
  }

  const response: KouyouRecommendResponse = {
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

export { kouyouRecommendRoute };

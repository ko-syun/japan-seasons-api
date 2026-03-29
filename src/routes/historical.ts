import { Hono } from "hono";
import type { Env, HistoricalResponse } from "../types.js";
import { LOCATION_BY_ID, toLocationRef } from "../data/locations.js";
import {
  getHistoricalRecords,
  computeStatistics,
} from "../services/sakuraService.js";

const historicalRoute = new Hono<{ Bindings: Env }>();

historicalRoute.get("/", async (c) => {
  const city = c.req.query("city");

  if (!city) {
    return c.json(
      {
        error: {
          code: "MISSING_PARAMETER",
          message: "city parameter is required. Example: ?city=tokyo",
        },
      },
      400
    );
  }

  const meta = LOCATION_BY_ID[city];
  if (!meta) {
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

  const yearParam = c.req.query("year");
  const fromYear = c.req.query("from_year");
  const toYear = c.req.query("to_year");

  const from = yearParam
    ? parseInt(yearParam, 10)
    : fromYear
      ? parseInt(fromYear, 10)
      : undefined;

  const to = yearParam
    ? parseInt(yearParam, 10)
    : toYear
      ? parseInt(toYear, 10)
      : undefined;

  const records = await getHistoricalRecords(c.env.DB, city, from, to);
  const statistics = computeStatistics(records);

  const response: HistoricalResponse = {
    data: {
      location: toLocationRef(meta),
      records,
      statistics,
    },
    meta: {
      source: "jma",
      attribution:
        "Data sourced from Japan Meteorological Agency (気象庁)",
    },
  };

  return c.json(response);
});

export { historicalRoute };

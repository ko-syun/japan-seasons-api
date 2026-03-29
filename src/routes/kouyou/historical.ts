import { Hono } from "hono";
import type { Env, KouyouHistoricalResponse } from "../../types.js";
import { KOUYOU_LOCATION_BY_ID } from "../../data/kouyouLocations.js";
import { toLocationRef } from "../../data/locations.js";
import {
  getKouyouHistoricalRecords,
  computeKouyouStatistics,
} from "../../services/kouyouService.js";
import { parseYear } from "../../utils/params.js";

const kouyouHistoricalRoute = new Hono<{ Bindings: Env }>();

kouyouHistoricalRoute.get("/", async (c) => {
  const city = c.req.query("city");

  if (!city) {
    return c.json(
      {
        error: {
          code: "MISSING_PARAMETER",
          message:
            "city parameter is required. Example: ?city=kyoto",
        },
      },
      400
    );
  }

  const meta = KOUYOU_LOCATION_BY_ID[city];
  if (!meta) {
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

  const yearParam = c.req.query("year");
  const fromYearParam = c.req.query("from_year");
  const toYearParam = c.req.query("to_year");

  const from = parseYear(yearParam) ?? parseYear(fromYearParam);
  const to = parseYear(yearParam) ?? parseYear(toYearParam);

  const records = await getKouyouHistoricalRecords(c.env.DB, city, from, to);
  const statistics = computeKouyouStatistics(records);

  const response: KouyouHistoricalResponse = {
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

export { kouyouHistoricalRoute };

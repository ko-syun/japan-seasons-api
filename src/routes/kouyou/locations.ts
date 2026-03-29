import { Hono } from "hono";
import type { Env, LocationsResponse } from "../../types.js";
import { KOUYOU_LOCATION_BY_ID } from "../../data/kouyouLocations.js";
import { getCached, setCache, KOUYOU_CACHE_KEYS, TTL } from "../../services/cacheService.js";
import { safeWaitUntil } from "../../utils/waitUntil.js";

const kouyouLocationsRoute = new Hono<{ Bindings: Env }>();

kouyouLocationsRoute.get("/", async (c) => {
  const cached = await getCached<LocationsResponse>(
    c.env.KV,
    KOUYOU_CACHE_KEYS.locations
  );
  if (cached) return c.json(cached);

  const allLocations = Object.values(KOUYOU_LOCATION_BY_ID);

  const data = allLocations.map((loc) => ({
    id: loc.id,
    name: loc.name_en,
    name_ja: loc.name_ja,
    prefecture: loc.prefecture_en,
    prefecture_ja: loc.prefecture_ja,
    region: loc.region,
    coordinates: { lat: loc.lat, lon: loc.lon },
    tree_species: loc.tree_species,
    observation_years: { from: 1953, to: new Date().getFullYear() },
  }));

  const response: LocationsResponse = {
    data,
    meta: { total: data.length },
  };

  safeWaitUntil(
    c,
    setCache(c.env.KV, KOUYOU_CACHE_KEYS.locations, response, TTL.locations)
  );

  return c.json(response);
});

export { kouyouLocationsRoute };

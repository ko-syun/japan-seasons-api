import { Hono } from "hono";
import type { Env, LocationsResponse } from "../types.js";
import { LOCATION_BY_ID } from "../data/locations.js";
import { getCached, setCache, CACHE_KEYS, TTL } from "../services/cacheService.js";

const locationsRoute = new Hono<{ Bindings: Env }>();

locationsRoute.get("/", async (c) => {
  // Try cache first
  const cached = await getCached<LocationsResponse>(c.env.KV, CACHE_KEYS.locations);
  if (cached) return c.json(cached);

  const allLocations = Object.values(LOCATION_BY_ID);

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

  c.executionCtx.waitUntil(
    setCache(c.env.KV, CACHE_KEYS.locations, response, TTL.locations)
  );

  return c.json(response);
});

export { locationsRoute };

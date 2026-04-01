import { Hono } from "hono";
import type { Env } from "../types.js";
import {
  searchMatsuri,
  getUpcomingMatsuri,
  getMatsuriById,
} from "../services/matsuriService.js";
import { getCached, setCache } from "../services/cacheService.js";
import { safeWaitUntil } from "../utils/waitUntil.js";

const CACHE_PREFIX = "cache:matsuri";
const TTL_SEARCH = 3600; // 1 hour
const TTL_DETAIL = 86400; // 24 hours

const matsuriRoute = new Hono<{ Bindings: Env }>();

// ── GET /search ──
matsuriRoute.get("/search", async (c) => {
  const region = c.req.query("region");
  const monthRaw = c.req.query("month");
  const city = c.req.query("city");
  const prefecture = c.req.query("prefecture");
  const category = c.req.query("category");
  const limitRaw = c.req.query("limit");
  const offsetRaw = c.req.query("offset");

  const month = monthRaw ? parseInt(monthRaw, 10) : undefined;
  if (monthRaw && (isNaN(month!) || month! < 1 || month! > 12)) {
    return c.json(
      { error: { code: "INVALID_PARAM", message: "month must be 1-12" } },
      400
    );
  }

  const limit = Math.min(Math.max(parseInt(limitRaw ?? "20", 10) || 20, 1), 100);
  const offset = Math.max(parseInt(offsetRaw ?? "0", 10) || 0, 0);

  // Cache key based on all params
  const cacheKey = `${CACHE_PREFIX}:search:${region ?? ""}:${month ?? ""}:${city ?? ""}:${prefecture ?? ""}:${category ?? ""}:${limit}:${offset}`;
  const cached = await getCached<unknown>(c.env.KV, cacheKey);
  if (cached) return c.json(cached);

  const { results, total } = await searchMatsuri(c.env.DB, {
    region,
    month,
    city,
    prefecture,
    category,
    limit,
    offset,
  });

  const response = {
    data: results,
    meta: {
      total,
      limit,
      offset,
      source: "curated",
    },
  };

  safeWaitUntil(c, setCache(c.env.KV, cacheKey, response, TTL_SEARCH));

  return c.json(response);
});

// ── GET /upcoming ──
matsuriRoute.get("/upcoming", async (c) => {
  const daysRaw = c.req.query("days");
  const region = c.req.query("region");
  const limitRaw = c.req.query("limit");

  const days = Math.min(Math.max(parseInt(daysRaw ?? "30", 10) || 30, 1), 365);
  const limit = Math.min(Math.max(parseInt(limitRaw ?? "10", 10) || 10, 1), 50);

  const cacheKey = `${CACHE_PREFIX}:upcoming:${days}:${region ?? ""}:${limit}`;
  const cached = await getCached<unknown>(c.env.KV, cacheKey);
  if (cached) return c.json(cached);

  const results = await getUpcomingMatsuri(c.env.DB, { days, region, limit });

  const response = {
    data: results,
    meta: {
      days,
      count: results.length,
      source: "curated",
    },
  };

  safeWaitUntil(c, setCache(c.env.KV, cacheKey, response, TTL_SEARCH));

  return c.json(response);
});

// ── GET /:id ──
matsuriRoute.get("/:id", async (c) => {
  const id = c.req.param("id");

  const cacheKey = `${CACHE_PREFIX}:detail:${id}`;
  const cached = await getCached<unknown>(c.env.KV, cacheKey);
  if (cached) return c.json(cached);

  const matsuri = await getMatsuriById(c.env.DB, id);

  if (!matsuri) {
    return c.json(
      { error: { code: "NOT_FOUND", message: `Festival '${id}' not found.` } },
      404
    );
  }

  const response = {
    data: matsuri,
    meta: {
      source: "curated",
    },
  };

  safeWaitUntil(c, setCache(c.env.KV, cacheKey, response, TTL_DETAIL));

  return c.json(response);
});

export { matsuriRoute };

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import type { Context } from "hono";
import type { Env } from "../types.js";
import {
  getStationStatuses,
  buildStatusSummary,
  getForecastData,
  getHistoricalRecords,
  computeStatistics,
  getRecommendation,
} from "../services/sakuraService.js";
import { LOCATION_BY_ID } from "../data/locations.js";

// ── Helper: safe JSON text result ──

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

// ── MCP Server Factory ──

function createMcpServer(db: D1Database, _kv: KVNamespace) {
  const server = new McpServer({
    name: "japan-seasons-api",
    version: "0.1.0",
  });

  // ── Sakura Tools ──

  server.registerTool(
    "get_sakura_status",
    {
      title: "Get Sakura Status",
      description:
        "Get the current cherry blossom (sakura) bloom status across Japan. Returns station-by-station status including bloom dates, current state, and comparison to historical normals.",
      inputSchema: {
        region: z
          .string()
          .optional()
          .describe(
            "Filter by region. One of: hokkaido, tohoku, kanto, hokuriku, tokai, kansai, chugoku, shikoku, kyushu, okinawa"
          ),
        status: z
          .string()
          .optional()
          .describe(
            "Filter by bloom status. One of: not_yet, budding, blooming, full_bloom, falling, ended"
          ),
        year: z
          .number()
          .optional()
          .describe("Year to query (default: current year)"),
      },
    },
    async ({ region, status, year }) => {
      try {
        const queryYear = year ?? new Date().getFullYear();
        const stations = await getStationStatuses(db, queryYear, region, status);
        const summary = buildStatusSummary(stations);
        return jsonResult({ season: queryYear, summary, stations });
      } catch (e) {
        return errorResult(`Failed to get sakura status: ${(e as Error).message}`);
      }
    }
  );

  server.registerTool(
    "get_sakura_forecast",
    {
      title: "Get Sakura Forecast",
      description:
        "Get cherry blossom bloom forecast based on 30-year historical averages. Returns estimated bloom windows, full bloom windows, and actual data for the current year.",
      inputSchema: {
        city: z
          .string()
          .optional()
          .describe(
            "City ID to get forecast for (e.g. 'tokyo', 'kyoto', 'osaka'). If omitted, returns all cities."
          ),
        region: z
          .string()
          .optional()
          .describe(
            "Filter by region (e.g. 'kanto', 'kansai'). Ignored if city is specified."
          ),
      },
    },
    async ({ city, region }) => {
      try {
        const year = new Date().getFullYear();
        const locations = await getForecastData(db, year, city, region);
        return jsonResult({
          season: year,
          note: "Forecasts based on 30-year historical averages from JMA observation data.",
          locations,
        });
      } catch (e) {
        return errorResult(`Failed to get sakura forecast: ${(e as Error).message}`);
      }
    }
  );

  server.registerTool(
    "get_sakura_historical",
    {
      title: "Get Sakura Historical Data",
      description:
        "Get historical cherry blossom bloom records for a specific city. Includes bloom dates, statistics, and long-term trends. Data available from 1953 to present.",
      inputSchema: {
        city: z
          .string()
          .describe(
            "City ID (required). Examples: 'tokyo', 'kyoto', 'osaka', 'sapporo', 'fukuoka'"
          ),
        from_year: z.number().optional().describe("Start year for the range (e.g. 2000)"),
        to_year: z.number().optional().describe("End year for the range (e.g. 2025)"),
      },
    },
    async ({ city, from_year, to_year }) => {
      try {
        const meta = LOCATION_BY_ID[city];
        if (!meta) {
          return errorResult(`Unknown city: '${city}'. Use get_sakura_locations to see valid IDs.`);
        }
        const records = await getHistoricalRecords(db, city, from_year, to_year);
        const statistics = computeStatistics(records);
        return jsonResult({
          location: {
            id: meta.id,
            name: meta.name_en,
            prefecture: meta.prefecture_en,
            region: meta.region,
          },
          records,
          statistics,
        });
      } catch (e) {
        return errorResult(`Failed to get historical data: ${(e as Error).message}`);
      }
    }
  );

  server.registerTool(
    "get_sakura_locations",
    {
      title: "List Sakura Observation Locations",
      description:
        "List all 58 JMA cherry blossom observation stations across Japan. Returns city IDs, names, prefectures, regions, coordinates, and tree species for each location.",
      inputSchema: {},
    },
    async () => {
      try {
        const locations = Object.values(LOCATION_BY_ID).map((loc) => ({
          id: loc.id,
          name: loc.name_en,
          name_ja: loc.name_ja,
          prefecture: loc.prefecture_en,
          region: loc.region,
          coordinates: { lat: loc.lat, lon: loc.lon },
          tree_species: loc.tree_species,
        }));
        return jsonResult({ locations, total: locations.length });
      } catch (e) {
        return errorResult(`Failed to get locations: ${(e as Error).message}`);
      }
    }
  );

  server.registerTool(
    "recommend_sakura_timing",
    {
      title: "Sakura Travel Timing Recommendation",
      description:
        "Get a personalized cherry blossom viewing recommendation. Analyzes historical bloom data to estimate the likelihood of seeing sakura during your travel dates. Suggests alternative cities if timing doesn't align.",
      inputSchema: {
        city: z
          .string()
          .optional()
          .describe("City ID (default: 'tokyo'). Use get_sakura_locations to see all options."),
        dates: z
          .string()
          .optional()
          .describe(
            "Travel date range in YYYY-MM-DD/YYYY-MM-DD format (e.g. '2025-03-25/2025-04-05')"
          ),
      },
    },
    async ({ city, dates }) => {
      try {
        const year = new Date().getFullYear();
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
          db,
          { city, dateFrom, dateTo },
          year
        );
        if (!recommendation) {
          return errorResult(
            `No data available for city '${city ?? "tokyo"}'. Use get_sakura_locations to see valid IDs.`
          );
        }
        return jsonResult({
          query: { city: city ?? "tokyo", dates: dates ?? null },
          recommendation,
        });
      } catch (e) {
        return errorResult(`Failed to get recommendation: ${(e as Error).message}`);
      }
    }
  );

  // ── Kouyou Tools (coming soon) ──

  const kouyouNotAvailable = async () =>
    jsonResult({
      status: "coming_soon",
      message:
        "Kouyou (autumn foliage) data is being added. Sakura endpoints are fully available now.",
    });

  server.registerTool(
    "get_kouyou_status",
    {
      title: "Get Kouyou Status",
      description:
        "Get the current autumn foliage (kouyou) status across Japan. NOTE: This endpoint is coming soon — kouyou data is being added.",
      inputSchema: {
        region: z.string().optional().describe("Filter by region"),
        status: z.string().optional().describe("Filter by foliage status"),
        year: z.number().optional().describe("Year to query"),
      },
    },
    kouyouNotAvailable
  );

  server.registerTool(
    "get_kouyou_forecast",
    {
      title: "Get Kouyou Forecast",
      description:
        "Get autumn foliage forecast. NOTE: This endpoint is coming soon — kouyou data is being added.",
      inputSchema: {
        city: z.string().optional().describe("City ID"),
        region: z.string().optional().describe("Filter by region"),
      },
    },
    kouyouNotAvailable
  );

  server.registerTool(
    "get_kouyou_historical",
    {
      title: "Get Kouyou Historical Data",
      description:
        "Get historical autumn foliage records. NOTE: This endpoint is coming soon — kouyou data is being added.",
      inputSchema: {
        city: z.string().describe("City ID (required)"),
        from_year: z.number().optional().describe("Start year"),
        to_year: z.number().optional().describe("End year"),
      },
    },
    kouyouNotAvailable
  );

  server.registerTool(
    "get_kouyou_locations",
    {
      title: "List Kouyou Observation Locations",
      description:
        "List all kouyou observation locations. NOTE: This endpoint is coming soon — kouyou data is being added.",
      inputSchema: {},
    },
    kouyouNotAvailable
  );

  server.registerTool(
    "recommend_kouyou_timing",
    {
      title: "Kouyou Travel Timing Recommendation",
      description:
        "Get autumn foliage viewing recommendation. NOTE: This endpoint is coming soon — kouyou data is being added.",
      inputSchema: {
        city: z.string().optional().describe("City ID"),
        dates: z.string().optional().describe("Travel date range (YYYY-MM-DD/YYYY-MM-DD)"),
      },
    },
    kouyouNotAvailable
  );

  return server;
}

// ── Rate limiting for MCP ──

async function checkMcpRateLimit(kv: KVNamespace, ip: string): Promise<boolean> {
  const MCP_RATE_LIMIT = 1000; // requests per day
  const today = new Date().toISOString().slice(0, 10);
  const key = `ratelimit:mcp:${ip}:${today}`;
  const currentStr = await kv.get(key);
  const current = currentStr ? parseInt(currentStr, 10) : 0;
  if (current >= MCP_RATE_LIMIT) return false;
  await kv.put(key, String(current + 1), { expirationTtl: 86400 });
  return true;
}

// ── Hono Handler ──

export async function mcpHandler(c: Context<{ Bindings: Env }>) {
  // Rate limit by IP
  const ip =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for") ??
    "unknown";

  const allowed = await checkMcpRateLimit(c.env.KV, ip);
  if (!allowed) {
    return c.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "MCP rate limit exceeded (1000 requests/day). Please try again tomorrow.",
        },
        id: null,
      },
      429
    );
  }

  // Create stateless transport + server per request
  const transport = new WebStandardStreamableHTTPServerTransport();
  const server = createMcpServer(c.env.DB, c.env.KV);

  await server.connect(transport);

  return transport.handleRequest(c.req.raw);
}

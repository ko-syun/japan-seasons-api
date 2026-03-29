import { Hono } from "hono";
import type { Env } from "./types.js";
import { corsMiddleware } from "./middleware/cors.js";
import { authMiddleware } from "./middleware/auth.js";
import { rateLimitMiddleware } from "./middleware/rateLimit.js";
import { statusRoute } from "./routes/status.js";
import { forecastRoute } from "./routes/forecast.js";
import { historicalRoute } from "./routes/historical.js";
import { locationsRoute } from "./routes/locations.js";
import { recommendRoute } from "./routes/recommend.js";
import { kouyouStatusRoute } from "./routes/kouyou/status.js";
import { kouyouForecastRoute } from "./routes/kouyou/forecast.js";
import { kouyouHistoricalRoute } from "./routes/kouyou/historical.js";
import { kouyouLocationsRoute } from "./routes/kouyou/locations.js";
import { kouyouRecommendRoute } from "./routes/kouyou/recommend.js";
import { handleScheduled } from "./cron/ingest.js";
import { adminRoute } from "./routes/admin.js";
import { matsuriRoute } from "./routes/matsuri.js";
import { mcpHandler } from "./mcp/server.js";
import { dashboardRoute } from "./routes/dashboard.js";
import { dashboardHtml } from "./dashboard/static/index.js";
import { landingHtml } from "./landing/index.js";

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ──
app.use("*", corsMiddleware);

// ── Admin (temporary, remove after data import) ──
app.route("/admin", adminRoute);

// ── Landing page ──
app.get("/", (c) => c.html(landingHtml));

app.get("/health", (c) => c.json({ status: "ok" }));

// ── Authenticated routes ──
const v1 = new Hono<{ Bindings: Env }>();
v1.use("*", authMiddleware as never);
v1.use("*", rateLimitMiddleware as never);

v1.route("/sakura/status", statusRoute);
v1.route("/sakura/forecast", forecastRoute);
v1.route("/sakura/historical", historicalRoute);
v1.route("/sakura/locations", locationsRoute);
v1.route("/sakura/recommend", recommendRoute);

v1.route("/kouyou/status", kouyouStatusRoute);
v1.route("/kouyou/forecast", kouyouForecastRoute);
v1.route("/kouyou/historical", kouyouHistoricalRoute);
v1.route("/kouyou/locations", kouyouLocationsRoute);
v1.route("/kouyou/recommend", kouyouRecommendRoute);
v1.route("/matsuri", matsuriRoute);

app.route("/v1", v1);

// ── Dashboard ──
app.get("/dashboard", (c) => c.html(dashboardHtml));
app.get("/dashboard/", (c) => c.html(dashboardHtml));
app.route("/dashboard", dashboardRoute);

// ── MCP endpoint (no auth, rate limited) ──
app.all("/mcp", mcpHandler as never);
app.all("/mcp/*", mcpHandler as never);

// ── 404 handler ──
app.notFound((c) =>
  c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: `Route ${c.req.method} ${c.req.path} not found.`,
      },
    },
    404
  )
);

// ── Error handler ──
app.onError((err, c) => {
  const isProduction = c.env?.ENVIRONMENT === "production";
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: isProduction
          ? "An unexpected error occurred."
          : err.message,
        ...(isProduction ? {} : { stack: err.stack }),
      },
    },
    500
  );
});

// ── Export ──
export default {
  fetch: app.fetch,
  scheduled: handleScheduled,
};

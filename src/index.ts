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
import { handleScheduled } from "./cron/ingest.js";

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ──
app.use("*", corsMiddleware);

// ── Health check (no auth) ──
app.get("/", (c) =>
  c.json({
    name: "Japan Seasons API",
    version: "0.1.0",
    docs: "https://japanseasons.com/docs",
  })
);

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

app.route("/v1", v1);

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
  const isProduction = c.env.ENVIRONMENT === "production";
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: isProduction
          ? "An unexpected error occurred."
          : err.message,
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

import { Hono } from "hono";
import type { Env } from "./types.js";
import { corsMiddleware } from "./middleware/cors.js";
import { authMiddleware } from "./middleware/auth.js";
import { x402Middleware, getPricingMap } from "./middleware/x402.js";
import { rateLimitMiddleware } from "./middleware/rateLimit.js";
import { requestLogMiddleware } from "./middleware/requestLog.js";
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
import { handleBillingCron } from "./cron/billing.js";
import { handleDailyReportCron } from "./cron/dailyReport.js";
import { adminRoute } from "./routes/admin.js";
import { matsuriRoute } from "./routes/matsuri.js";
import { mcpHandler } from "./mcp/server.js";
import { dashboardRoute } from "./routes/dashboard.js";
import { dashboardHtml } from "./dashboard/static/index.js";
import { landingHtml } from "./landing/index.js";
import {
  robotsTxt,
  sitemapXml,
  llmsTxt,
  llmsFullTxt,
  jsonLd,
  aiPluginJson,
} from "./seo/static.js";

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ──
app.use("*", corsMiddleware);

// ── SEO & AI discovery ──
app.get("/robots.txt", (c) => c.text(robotsTxt));
app.get("/sitemap.xml", (c) => {
  c.header("Content-Type", "application/xml");
  return c.body(sitemapXml);
});
app.get("/llms.txt", (c) => c.text(llmsTxt));
app.get("/llms-full.txt", (c) => c.text(llmsFullTxt));
app.get("/.well-known/ai-plugin.json", (c) => c.json(JSON.parse(aiPluginJson)));

// ── Admin (temporary, remove after data import) ──
app.route("/admin", adminRoute);

// ── Landing page (inject JSON-LD) ──
app.get("/", (c) => {
  const html = landingHtml.replace(
    "</head>",
    `<link rel="canonical" href="https://jpseasons.dokos.dev/" />\n<script type="application/ld+json">${jsonLd}</script>\n</head>`
  );
  return c.html(html);
});

app.get("/health", (c) => c.json({ status: "ok" }));

// ── x402 Payment Protocol info (no auth required) ──
app.get("/x402/info", (c) => {
  const payTo = c.env.X402_PAYTO_ADDRESS;
  return c.json({
    x402Version: 1,
    supportedNetworks: ["base"],
    supportedAssets: ["USDC"],
    pricing: getPricingMap(),
    payTo: payTo ?? null,
    facilitator: "https://x402.org/facilitator",
    documentation: "https://www.x402.org",
    note: payTo
      ? "Send PAYMENT-SIGNATURE header (base64-encoded) or X-PAYMENT header with signed payment to access API endpoints without an API key."
      : "x402 payments not yet configured. Use X-API-Key header for access.",
    paymentAccepted: !!payTo,
  });
});

// ── Authenticated routes ──
const v1 = new Hono<{ Bindings: Env }>();
v1.use("*", x402Middleware as never);
v1.use("*", authMiddleware as never);
v1.use("*", rateLimitMiddleware as never);
v1.use("*", requestLogMiddleware as never);

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
  scheduled: async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
    // Daily ingest cron (existing)
    if (event.cron === "0 1 * * *") {
      await handleScheduled(event, env, ctx);
    }
    // Monthly billing cron (1st of month at 00:10 UTC)
    if (event.cron === "10 0 1 * *") {
      ctx.waitUntil(handleBillingCron(env));
    }
    // Daily report cron (09:34 JST = 00:34 UTC)
    if (event.cron === "34 0 * * *") {
      ctx.waitUntil(handleDailyReportCron(env));
    }
    // If cron doesn't match specific patterns, run ingest (backward compat)
    if (event.cron !== "0 1 * * *" && event.cron !== "10 0 1 * *" && event.cron !== "34 0 * * *") {
      await handleScheduled(event, env, ctx);
    }
  },
};

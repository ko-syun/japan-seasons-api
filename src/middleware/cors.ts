import { Context, Next } from "hono";

export async function corsMiddleware(c: Context, next: Next) {
  // Set CORS headers BEFORE next() so they're present even on error responses
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  c.header("Access-Control-Max-Age", "86400");

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();
}

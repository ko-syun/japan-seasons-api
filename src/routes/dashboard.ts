import { Hono, Context } from "hono";
import type { Env } from "../types.js";
import {
  hashPassword,
  verifyPassword,
  createJwt,
  verifyJwt,
  generateApiKey,
  hashApiKey,
  generateId,
} from "../dashboard/auth.js";
import {
  createCustomer,
  createCheckoutSession,
  createPortalSession,
  verifyWebhookSignature,
  handleWebhookEvent,
  type StripeEvent,
} from "../dashboard/stripe.js";
import { safeWaitUntil } from "../utils/waitUntil.js";

type DashboardEnv = { Bindings: Env };

const dashboard = new Hono<DashboardEnv>();

// ── Helpers ──

function errorResponse(c: Context, code: string, message: string, status: number) {
  return c.json({ error: { code, message } }, status as 400);
}

function getJwtSecret(c: Context<DashboardEnv>): string {
  const secret = c.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

async function getAuthUser(
  c: Context<DashboardEnv>
): Promise<{ sub: string; email: string } | null> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyJwt(token, getJwtSecret(c));
}

// ── Auth Routes ──

dashboard.post("/api/signup", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse(c, "INVALID_INPUT", "Email and password are required.", 400);
  }

  if (password.length < 8) {
    return errorResponse(c, "INVALID_INPUT", "Password must be at least 8 characters.", 400);
  }

  // Check if email already exists
  const existing = await c.env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (existing) {
    return errorResponse(c, "EMAIL_EXISTS", "An account with this email already exists.", 409);
  }

  const userId = generateId();
  const passwordHash = await hashPassword(password);

  // Create Stripe customer (background, non-blocking for signup)
  let stripeCustomerId: string | null = null;
  if (c.env.STRIPE_SECRET_KEY) {
    try {
      stripeCustomerId = await createCustomer(email, c.env.STRIPE_SECRET_KEY);
    } catch {
      // Non-fatal: user can still sign up without Stripe
    }
  }

  await c.env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, stripe_customer_id, tier) VALUES (?, ?, ?, ?, 'free')"
  )
    .bind(userId, email, passwordHash, stripeCustomerId)
    .run();

  const token = await createJwt(userId, email, getJwtSecret(c));

  return c.json(
    {
      data: {
        user: { id: userId, email, tier: "free" },
        token,
      },
    },
    201
  );
});

dashboard.post("/api/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse(c, "INVALID_INPUT", "Email and password are required.", 400);
  }

  const user = await c.env.DB.prepare(
    "SELECT id, email, password_hash, tier FROM users WHERE email = ?"
  )
    .bind(email)
    .first<{ id: string; email: string; password_hash: string; tier: string }>();

  if (!user) {
    return errorResponse(c, "INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return errorResponse(c, "INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const token = await createJwt(user.id, user.email, getJwtSecret(c));

  return c.json({
    data: {
      user: { id: user.id, email: user.email, tier: user.tier },
      token,
    },
  });
});

// ── Keys Routes (auth required) ──

dashboard.get("/api/keys", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return errorResponse(c, "UNAUTHORIZED", "Valid authentication required.", 401);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, name, tier, is_active, created_at, last_used_at FROM user_api_keys WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.sub)
    .all<{
      id: string;
      name: string;
      tier: string;
      is_active: number;
      created_at: string;
      last_used_at: string | null;
    }>();

  return c.json({
    data: {
      keys: results.map((k) => ({
        id: k.id,
        name: k.name,
        tier: k.tier,
        is_active: !!k.is_active,
        created_at: k.created_at,
        last_used_at: k.last_used_at,
      })),
    },
  });
});

dashboard.post("/api/keys", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return errorResponse(c, "UNAUTHORIZED", "Valid authentication required.", 401);
  }

  const body = await c.req.json<{ name?: string }>().catch(() => ({}));
  const name = (body as { name?: string }).name || "default";

  // Get user's tier
  const userData = await c.env.DB.prepare(
    "SELECT tier FROM users WHERE id = ?"
  )
    .bind(user.sub)
    .first<{ tier: string }>();

  const tier = userData?.tier ?? "free";

  // Check key limit (free: 2, pro: 10)
  const keyCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM user_api_keys WHERE user_id = ? AND is_active = 1"
  )
    .bind(user.sub)
    .first<{ count: number }>();

  const limit = tier === "pro" ? 10 : 2;
  if (keyCount && keyCount.count >= limit) {
    return errorResponse(
      c,
      "KEY_LIMIT_REACHED",
      `You can have at most ${limit} active keys on the ${tier} tier.`,
      403
    );
  }

  const plainKey = generateApiKey();
  const keyHash = await hashApiKey(plainKey);
  const keyId = generateId();

  await c.env.DB.prepare(
    "INSERT INTO user_api_keys (id, user_id, key_hash, name, tier, is_active) VALUES (?, ?, ?, ?, ?, 1)"
  )
    .bind(keyId, user.sub, keyHash, name, tier)
    .run();

  // Also insert into the main api_keys table so the auth middleware works
  await c.env.DB.prepare(
    "INSERT INTO api_keys (key_hash, tier, owner_email, is_active) VALUES (?, ?, ?, 1)"
  )
    .bind(keyHash, tier, user.email)
    .run();

  return c.json(
    {
      data: {
        id: keyId,
        name,
        tier,
        key: plainKey, // Returned only once!
      },
    },
    201
  );
});

dashboard.delete("/api/keys/:id", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return errorResponse(c, "UNAUTHORIZED", "Valid authentication required.", 401);
  }

  const keyId = c.req.param("id");

  // Get the key hash before deactivating so we can also deactivate in api_keys
  const keyRow = await c.env.DB.prepare(
    "SELECT key_hash FROM user_api_keys WHERE id = ? AND user_id = ?"
  )
    .bind(keyId, user.sub)
    .first<{ key_hash: string }>();

  if (!keyRow) {
    return errorResponse(c, "NOT_FOUND", "API key not found.", 404);
  }

  // Deactivate in both tables
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE user_api_keys SET is_active = 0 WHERE id = ? AND user_id = ?"
    ).bind(keyId, user.sub),
    c.env.DB.prepare(
      "UPDATE api_keys SET is_active = 0 WHERE key_hash = ?"
    ).bind(keyRow.key_hash),
  ]);

  return c.json({ data: { id: keyId, revoked: true } });
});

// ── Usage Route ──

dashboard.get("/api/usage", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return errorResponse(c, "UNAUTHORIZED", "Valid authentication required.", 401);
  }

  // Get user's key hashes
  const { results: keys } = await c.env.DB.prepare(
    "SELECT key_hash FROM user_api_keys WHERE user_id = ? AND is_active = 1"
  )
    .bind(user.sub)
    .all<{ key_hash: string }>();

  if (keys.length === 0) {
    return c.json({ data: { daily: [], total_requests: 0 } });
  }

  // For MVP, return basic usage data based on last_used_at
  // A proper implementation would have a request_log table
  const userData = await c.env.DB.prepare(
    "SELECT tier FROM users WHERE id = ?"
  )
    .bind(user.sub)
    .first<{ tier: string }>();

  return c.json({
    data: {
      tier: userData?.tier ?? "free",
      keys_active: keys.length,
      rate_limit: userData?.tier === "pro" ? 10000 : 100,
      unit: "requests/day",
    },
  });
});

// ── Stripe Billing Routes ──

dashboard.post("/api/checkout", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return errorResponse(c, "UNAUTHORIZED", "Valid authentication required.", 401);
  }

  if (!c.env.STRIPE_SECRET_KEY) {
    return errorResponse(c, "BILLING_UNAVAILABLE", "Billing is not configured.", 503);
  }

  const userData = await c.env.DB.prepare(
    "SELECT stripe_customer_id, tier FROM users WHERE id = ?"
  )
    .bind(user.sub)
    .first<{ stripe_customer_id: string | null; tier: string }>();

  if (!userData) {
    return errorResponse(c, "NOT_FOUND", "User not found.", 404);
  }

  if (userData.tier === "pro") {
    return errorResponse(c, "ALREADY_PRO", "You are already on the Pro tier.", 400);
  }

  let customerId = userData.stripe_customer_id;
  if (!customerId) {
    customerId = await createCustomer(user.email, c.env.STRIPE_SECRET_KEY);
    await c.env.DB.prepare(
      "UPDATE users SET stripe_customer_id = ? WHERE id = ?"
    )
      .bind(customerId, user.sub)
      .run();
  }

  const body = await c.req.json<{ price_id?: string }>().catch(() => ({}));
  const priceId = (body as { price_id?: string }).price_id || "price_pro_monthly";

  const origin = new URL(c.req.url).origin;
  const url = await createCheckoutSession(
    customerId,
    priceId,
    `${origin}/dashboard?checkout=success`,
    `${origin}/dashboard?checkout=cancelled`,
    c.env.STRIPE_SECRET_KEY
  );

  return c.json({ data: { url } });
});

dashboard.post("/api/portal", async (c) => {
  const user = await getAuthUser(c);
  if (!user) {
    return errorResponse(c, "UNAUTHORIZED", "Valid authentication required.", 401);
  }

  if (!c.env.STRIPE_SECRET_KEY) {
    return errorResponse(c, "BILLING_UNAVAILABLE", "Billing is not configured.", 503);
  }

  const userData = await c.env.DB.prepare(
    "SELECT stripe_customer_id FROM users WHERE id = ?"
  )
    .bind(user.sub)
    .first<{ stripe_customer_id: string | null }>();

  if (!userData?.stripe_customer_id) {
    return errorResponse(c, "NO_SUBSCRIPTION", "No billing account found.", 400);
  }

  const origin = new URL(c.req.url).origin;
  const url = await createPortalSession(
    userData.stripe_customer_id,
    `${origin}/dashboard`,
    c.env.STRIPE_SECRET_KEY
  );

  return c.json({ data: { url } });
});

// ── Stripe Webhook ──

dashboard.post("/api/webhooks/stripe", async (c) => {
  if (!c.env.STRIPE_WEBHOOK_SECRET) {
    return errorResponse(c, "WEBHOOK_UNAVAILABLE", "Webhook secret not configured.", 503);
  }

  const signature = c.req.header("Stripe-Signature");
  if (!signature) {
    return errorResponse(c, "INVALID_SIGNATURE", "Missing Stripe-Signature header.", 400);
  }

  const payload = await c.req.text();
  const valid = await verifyWebhookSignature(
    payload,
    signature,
    c.env.STRIPE_WEBHOOK_SECRET
  );

  if (!valid) {
    return errorResponse(c, "INVALID_SIGNATURE", "Invalid webhook signature.", 400);
  }

  const event = JSON.parse(payload) as StripeEvent;

  // Process webhook in background
  safeWaitUntil(c, handleWebhookEvent(event, c.env.DB));

  return c.json({ received: true });
});

export { dashboard as dashboardRoute };

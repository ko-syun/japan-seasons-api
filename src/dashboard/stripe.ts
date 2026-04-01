/**
 * Stripe integration using REST API directly.
 * No npm package — keeps bundle small for Workers.
 */

const STRIPE_API_BASE = "https://api.stripe.com/v1";

// ── API Helpers ──

async function stripeRequest(
  path: string,
  secretKey: string,
  method: "GET" | "POST" = "POST",
  body?: Record<string, string>
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const options: RequestInit = { method, headers };
  if (body) {
    options.body = new URLSearchParams(body).toString();
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, options);
  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    const err = data.error as Record<string, unknown> | undefined;
    throw new Error(
      `Stripe API error: ${err?.message ?? response.statusText}`
    );
  }

  return data;
}

// ── Customer ──

export async function createCustomer(
  email: string,
  secretKey: string
): Promise<string> {
  const data = await stripeRequest("/customers", secretKey, "POST", {
    email,
  });
  return data.id as string;
}

// ── Checkout Session ──

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  secretKey: string
): Promise<string> {
  const data = await stripeRequest(
    "/checkout/sessions",
    secretKey,
    "POST",
    {
      customer: customerId,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    }
  );
  return data.url as string;
}

// ── Customer Portal ──

export async function createPortalSession(
  customerId: string,
  returnUrl: string,
  secretKey: string
): Promise<string> {
  const data = await stripeRequest(
    "/billing_portal/sessions",
    secretKey,
    "POST",
    {
      customer: customerId,
      return_url: returnUrl,
    }
  );
  return data.url as string;
}

// ── Metered Usage Reporting ──

export async function reportUsage(
  subscriptionItemId: string,
  quantity: number,
  secretKey: string
): Promise<void> {
  const response = await fetch(
    `${STRIPE_API_BASE}/subscription_items/${subscriptionItemId}/usage_records`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `quantity=${quantity}&action=increment`,
    }
  );

  if (!response.ok) {
    const data = (await response.json()) as Record<string, unknown>;
    const err = data.error as Record<string, unknown> | undefined;
    throw new Error(
      `Stripe usage report failed: ${err?.message ?? response.statusText}`
    );
  }
}

// ── Metered Checkout Session ──

export async function createMeteredCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  secretKey: string
): Promise<string> {
  const data = await stripeRequest(
    "/checkout/sessions",
    secretKey,
    "POST",
    {
      customer: customerId,
      "line_items[0][price]": priceId,
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    }
  );
  return data.url as string;
}

// ── Retrieve Subscription Items ──

export async function getSubscriptionItems(
  subscriptionId: string,
  secretKey: string
): Promise<Array<{ id: string; price: { id: string } }>> {
  const data = await stripeRequest(
    `/subscriptions/${subscriptionId}`,
    secretKey,
    "GET"
  );
  const items = data.items as { data: Array<{ id: string; price: { id: string } }> };
  return items.data;
}

// ── Webhook Signature Verification ──

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<boolean> {
  // Parse Stripe-Signature header
  const elements = signature.split(",");
  let timestamp = "";
  let v1Signature = "";

  for (const element of elements) {
    const [key, value] = element.split("=");
    if (key === "t") timestamp = value;
    if (key === "v1") v1Signature = value;
  }

  if (!timestamp || !v1Signature) return false;

  // Check timestamp (reject events older than 5 minutes)
  const eventTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - eventTime) > 300) return false;

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const expectedSignature = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Timing-safe comparison to prevent timing attacks
  const { timingSafeEqual } = await import("../utils/crypto.js");
  return timingSafeEqual(expectedSignature, v1Signature);
}

// ── Webhook Event Types ──

export interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export async function handleWebhookEvent(
  event: StripeEvent,
  db: D1Database
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string | null;

      // Determine if this is a PAYG or Pro checkout by checking metadata or subscription items
      // For now, check if the session has metadata.tier = 'payg'
      const metadata = session.metadata as Record<string, string> | undefined;
      const tier = metadata?.tier === "payg" ? "payg" : "pro";

      // Upgrade user
      await db
        .prepare("UPDATE users SET tier = ? WHERE stripe_customer_id = ?")
        .bind(tier, customerId)
        .run();

      // Update all user's active keys
      await db
        .prepare(
          `UPDATE user_api_keys SET tier = ? WHERE user_id = (
            SELECT id FROM users WHERE stripe_customer_id = ?
          ) AND is_active = 1`
        )
        .bind(tier, customerId)
        .run();

      // For PAYG: store subscription item mapping
      if (tier === "payg" && subscriptionId) {
        const userId = await db
          .prepare("SELECT id FROM users WHERE stripe_customer_id = ?")
          .bind(customerId)
          .first<{ id: string }>();

        if (userId) {
          // Store subscription ID — the item ID will be resolved during billing cron
          await db
            .prepare(
              `INSERT INTO subscription_items (user_id, stripe_subscription_item_id, stripe_subscription_id)
               VALUES (?, '', ?)
               ON CONFLICT(user_id) DO UPDATE SET
                 stripe_subscription_id = excluded.stripe_subscription_id`
            )
            .bind(userId.id, subscriptionId)
            .run();
        }
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      const status = subscription.status as string;

      if (status === "active") {
        // Check current tier — don't overwrite payg with pro or vice versa
        const user = await db
          .prepare("SELECT tier FROM users WHERE stripe_customer_id = ?")
          .bind(customerId)
          .first<{ tier: string }>();

        // Only update if currently free (initial activation)
        if (user && user.tier === "free") {
          await db
            .prepare(
              "UPDATE users SET tier = 'pro' WHERE stripe_customer_id = ?"
            )
            .bind(customerId)
            .run();
        }
      } else if (status === "past_due" || status === "unpaid") {
        // Keep current tier for now but could downgrade
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      // Downgrade to free
      await db
        .prepare(
          "UPDATE users SET tier = 'free' WHERE stripe_customer_id = ?"
        )
        .bind(customerId)
        .run();
      await db
        .prepare(
          `UPDATE user_api_keys SET tier = 'free' WHERE user_id = (
            SELECT id FROM users WHERE stripe_customer_id = ?
          ) AND is_active = 1`
        )
        .bind(customerId)
        .run();
      // Clean up subscription items
      await db
        .prepare(
          `DELETE FROM subscription_items WHERE user_id = (
            SELECT id FROM users WHERE stripe_customer_id = ?
          )`
        )
        .bind(customerId)
        .run();
      break;
    }
  }
}

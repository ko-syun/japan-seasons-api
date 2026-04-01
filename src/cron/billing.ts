import type { Env } from "../types.js";
import { reportUsage, getSubscriptionItems } from "../dashboard/stripe.js";

/**
 * Monthly billing cron: reports accumulated PAYG usage to Stripe.
 * Runs on the 1st of each month at 00:10 UTC.
 *
 * Flow:
 * 1. Query unreported usage_records grouped by user
 * 2. For each PAYG user: report total usage to Stripe
 * 3. Mark records as reported
 */
export async function handleBillingCron(env: Env): Promise<void> {
  if (!env.STRIPE_SECRET_KEY) {
    return;
  }

  // Get all unreported usage grouped by user
  const { results: usageByUser } = await env.DB.prepare(
    `SELECT
       u.user_id,
       SUM(u.request_count) as total_requests,
       si.stripe_subscription_item_id,
       si.stripe_subscription_id
     FROM usage_records u
     JOIN user_api_keys k ON u.key_hash = k.key_hash
     JOIN subscription_items si ON k.user_id = si.user_id
     WHERE u.reported_to_stripe = 0
     GROUP BY k.user_id`
  ).all<{
    user_id: string;
    total_requests: number;
    stripe_subscription_item_id: string;
    stripe_subscription_id: string;
  }>();

  for (const record of usageByUser) {
    if (record.total_requests === 0) continue;

    try {
      let subscriptionItemId = record.stripe_subscription_item_id;

      // If subscription item ID is not yet resolved, fetch it from Stripe
      if (!subscriptionItemId && record.stripe_subscription_id) {
        const items = await getSubscriptionItems(
          record.stripe_subscription_id,
          env.STRIPE_SECRET_KEY
        );
        if (items.length > 0) {
          subscriptionItemId = items[0].id;
          // Cache the subscription item ID
          await env.DB.prepare(
            `UPDATE subscription_items
             SET stripe_subscription_item_id = ?
             WHERE user_id = ?`
          )
            .bind(subscriptionItemId, record.user_id)
            .run();
        }
      }

      if (!subscriptionItemId) {
        continue;
      }

      // Report usage to Stripe
      await reportUsage(
        subscriptionItemId,
        record.total_requests,
        env.STRIPE_SECRET_KEY
      );

      // Mark all records for this user's keys as reported
      await env.DB.prepare(
        `UPDATE usage_records SET reported_to_stripe = 1
         WHERE reported_to_stripe = 0
         AND key_hash IN (
           SELECT key_hash FROM user_api_keys WHERE user_id = ?
         )`
      )
        .bind(record.user_id)
        .run();
    } catch (err) {
      // Log but don't throw — continue processing other users
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Billing report failed for user ${record.user_id}: ${message}`);
    }
  }
}

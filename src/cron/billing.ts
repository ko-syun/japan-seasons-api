import type { Env } from "../types.js";
import { reportUsage, getSubscriptionItems } from "../dashboard/stripe.js";

/**
 * Monthly billing cron: reports accumulated PAYG usage to Stripe.
 * Runs on the 1st of each month at 00:10 UTC.
 *
 * Flow:
 * 1. Snapshot unreported record IDs (prevents race with new records)
 * 2. For each PAYG user: report total usage to Stripe
 * 3. Mark snapshotted records as reported (ID-based, no duplicates)
 */
export async function handleBillingCron(env: Env): Promise<void> {
  if (!env.STRIPE_SECRET_KEY) {
    return;
  }

  // Step 1: Snapshot unreported record IDs before processing
  const { results: unreported } = await env.DB.prepare(
    `SELECT u.id, u.key_hash, u.request_count, k.user_id
     FROM usage_records u
     JOIN user_api_keys k ON u.key_hash = k.key_hash
     WHERE u.reported_to_stripe = 0`
  ).all<{
    id: number;
    key_hash: string;
    request_count: number;
    user_id: string;
  }>();

  if (unreported.length === 0) return;

  // Group by user
  const byUser = new Map<string, { totalRequests: number; recordIds: number[] }>();
  for (const row of unreported) {
    const existing = byUser.get(row.user_id) ?? { totalRequests: 0, recordIds: [] };
    existing.totalRequests += row.request_count;
    existing.recordIds.push(row.id);
    byUser.set(row.user_id, existing);
  }

  for (const [userId, data] of byUser) {
    if (data.totalRequests === 0) continue;

    try {
      // Get subscription item for this user
      const { results: siRows } = await env.DB.prepare(
        `SELECT stripe_subscription_item_id, stripe_subscription_id
         FROM subscription_items WHERE user_id = ?`
      ).bind(userId).all<{
        stripe_subscription_item_id: string;
        stripe_subscription_id: string;
      }>();

      if (siRows.length === 0) continue;

      let subscriptionItemId = siRows[0].stripe_subscription_item_id;

      // Lazy resolve subscription item ID if not yet cached
      if (!subscriptionItemId && siRows[0].stripe_subscription_id) {
        const items = await getSubscriptionItems(
          siRows[0].stripe_subscription_id,
          env.STRIPE_SECRET_KEY
        );
        if (items.length > 0) {
          subscriptionItemId = items[0].id;
          await env.DB.prepare(
            `UPDATE subscription_items SET stripe_subscription_item_id = ? WHERE user_id = ?`
          ).bind(subscriptionItemId, userId).run();
        }
      }

      if (!subscriptionItemId) continue;

      // Report usage to Stripe
      await reportUsage(
        subscriptionItemId,
        data.totalRequests,
        env.STRIPE_SECRET_KEY
      );

      // Mark ONLY the snapshotted records as reported (ID-based, prevents duplicates)
      const placeholders = data.recordIds.map(() => "?").join(",");
      await env.DB.prepare(
        `UPDATE usage_records SET reported_to_stripe = 1 WHERE id IN (${placeholders})`
      ).bind(...data.recordIds).run();

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Billing report failed for user ${userId}: ${message}`);
      // Don't mark as reported — will retry next month
    }
  }
}

import { Context } from "hono";

/**
 * Safe wrapper for executionCtx.waitUntil.
 * Hono's executionCtx getter throws when no ExecutionContext is available (e.g., in tests).
 */
export function safeWaitUntil(c: Context, promise: Promise<unknown>): void {
  try {
    c.executionCtx.waitUntil(promise);
  } catch {
    // No ExecutionContext (test environment) — let the promise run detached
  }
}

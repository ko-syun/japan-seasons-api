import type { Env } from "../types.js";

const CACHE_KEYS = {
  status: "cache:sakura:status",
  forecast: "cache:sakura:forecast",
  locations: "cache:sakura:locations",
} as const;

const TTL = {
  status: 21600,    // 6 hours
  forecast: 3600,   // 1 hour
  locations: 86400, // 24 hours
} as const;

export async function getCached<T>(
  kv: KVNamespace,
  key: string
): Promise<T | null> {
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache(
  kv: KVNamespace,
  key: string,
  data: unknown,
  ttl: number
): Promise<void> {
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
}

export async function invalidateCache(
  kv: KVNamespace,
  ...keys: string[]
): Promise<void> {
  await Promise.all(keys.map((k) => kv.delete(k)));
}

export { CACHE_KEYS, TTL };

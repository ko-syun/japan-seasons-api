/**
 * Parse a year query parameter safely.
 * Returns undefined for missing/invalid values, guards against NaN.
 */
export function parseYear(
  param: string | undefined,
  min = 1900,
  max = 2100
): number | undefined {
  if (!param) return undefined;
  const parsed = parseInt(param, 10);
  if (isNaN(parsed) || parsed < min || parsed > max) return undefined;
  return parsed;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate an ISO date string (YYYY-MM-DD format only).
 */
export function isValidDate(s: string): boolean {
  return DATE_REGEX.test(s);
}

/**
 * Parse a date range string "YYYY-MM-DD/YYYY-MM-DD".
 * Returns [from, to] or null if invalid.
 */
export function parseDateRange(
  dates: string | undefined
): [string, string] | null {
  if (!dates) return null;
  const parts = dates.split("/");
  if (parts.length !== 2) return null;
  if (!isValidDate(parts[0]) || !isValidDate(parts[1])) return null;
  return [parts[0], parts[1]];
}

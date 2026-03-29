/**
 * Shared parser utilities for JMA data scraping.
 */

/**
 * Convert Japanese month/day from JMA table cell to ISO date string.
 * JMA uses formats like "3.20" (March 20) or "4. 5" (April 5).
 * Returns null if the cell is empty or contains "−" (no observation).
 */
export function parseJmaDate(
  cell: string,
  year: number
): string | null {
  const trimmed = cell.trim().replace(/\s+/g, "");

  if (!trimmed || trimmed === "−" || trimmed === "-" || trimmed === "）") {
    return null;
  }

  // Match patterns like "3.20", "12.1", "4.05"
  const match = trimmed.match(/^(\d{1,2})\.(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Calculate days between two MM-DD strings.
 * Positive = later than normal, negative = earlier.
 */
export function diffDays(
  actual: string | null,
  normal: string | null
): number | null {
  if (!actual || !normal) return null;

  // Use a reference year for comparison
  const actualDate = new Date(`2000-${actual.slice(5)}`);
  const normalDate = new Date(`2000-${normal.slice(5)}`);

  if (isNaN(actualDate.getTime()) || isNaN(normalDate.getTime())) {
    return null;
  }

  const diffMs = actualDate.getTime() - normalDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Extract MM-DD from an ISO date string (YYYY-MM-DD).
 */
export function toMonthDay(isoDate: string | null): string | null {
  if (!isoDate) return null;
  return isoDate.slice(5);
}

/**
 * Build an ISO date string from year and MM-DD.
 */
export function fromMonthDay(
  year: number,
  monthDay: string
): string {
  return `${year}-${monthDay}`;
}

/**
 * Clean text extracted from HTML, removing extra whitespace and
 * special characters.
 */
export function cleanText(text: string): string {
  return text
    .replace(/[\r\n\t]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[\u00A0]/g, " ")
    .trim();
}

import * as cheerio from "cheerio";
import type { ScrapedObservation } from "../types.js";
import { parseJmaDate, cleanText } from "./parser.js";

/**
 * Parse JMA current-year sakura kaika (bloom) or mankai (full-bloom) page.
 * URL pattern:
 *   Bloom:     https://www.data.jma.go.jp/sakura/data/sakura_kaika.html
 *   Full bloom: https://www.data.jma.go.jp/sakura/data/sakura_mankai.html
 *
 * Returns array of (location_ja, year, month, day) observations.
 */
export function parseCurrentYearPage(
  html: string,
  year: number
): ScrapedObservation[] {
  const $ = cheerio.load(html);
  const results: ScrapedObservation[] = [];

  // JMA tables typically have rows with station name in first cell
  // and date in subsequent cells
  $("table tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    const locationText = cleanText($(cells[0]).text());
    if (!locationText || locationText.includes("地点")) return;

    const dateText = cleanText($(cells[1]).text());
    const parsed = parseJmaDate(dateText, year);

    if (locationText) {
      const month = parsed ? parseInt(parsed.slice(5, 7), 10) : null;
      const day = parsed ? parseInt(parsed.slice(8, 10), 10) : null;

      results.push({
        location_ja: locationText,
        year,
        month,
        day,
      });
    }
  });

  return results;
}

/**
 * Parse JMA historical decade page.
 * URL pattern: https://www.data.jma.go.jp/sakura/data/sakura003_06.html
 *
 * Historical tables have location name in first column and year columns across.
 * Each cell contains month.day format (e.g., "3.20").
 */
export function parseHistoricalDecadePage(
  html: string,
  startYear: number,
  endYear: number
): ScrapedObservation[] {
  const $ = cheerio.load(html);
  const results: ScrapedObservation[] = [];

  $("table tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    const locationText = cleanText($(cells[0]).text());
    if (!locationText || locationText.includes("地点") || locationText.includes("年")) {
      return;
    }

    // Each subsequent cell is a year's data
    for (let col = 1; col < cells.length; col++) {
      const year = startYear + (col - 1);
      if (year > endYear) break;

      const cellText = cleanText($(cells[col]).text());
      const parsed = parseJmaDate(cellText, year);

      const month = parsed ? parseInt(parsed.slice(5, 7), 10) : null;
      const day = parsed ? parseInt(parsed.slice(8, 10), 10) : null;

      results.push({
        location_ja: locationText,
        year,
        month,
        day,
      });
    }
  });

  return results;
}

/**
 * Fetch a URL with retry logic.
 */
export async function fetchWithRetry(
  url: string,
  retries = 3,
  delayMs = 1000
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "JapanSeasonsAPI/1.0 (https://japanseasons.com; contact@japanseasons.com)",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }

  throw new Error("fetchWithRetry: exhausted retries");
}

/**
 * JMA historical page URLs for sakura bloom data (kaika).
 * Each page covers a decade.
 */
export const JMA_HISTORICAL_PAGES = {
  bloom: [
    { url: "https://www.data.jma.go.jp/sakura/data/sakura003_00.html", startYear: 1953, endYear: 1960 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura003_01.html", startYear: 1961, endYear: 1970 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura003_02.html", startYear: 1971, endYear: 1980 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura003_03.html", startYear: 1981, endYear: 1990 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura003_04.html", startYear: 1991, endYear: 2000 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura003_05.html", startYear: 2001, endYear: 2010 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura003_06.html", startYear: 2011, endYear: 2020 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura003_07.html", startYear: 2021, endYear: 2025 },
  ],
  fullBloom: [
    { url: "https://www.data.jma.go.jp/sakura/data/sakura004_00.html", startYear: 1953, endYear: 1960 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura004_01.html", startYear: 1961, endYear: 1970 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura004_02.html", startYear: 1971, endYear: 1980 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura004_03.html", startYear: 1981, endYear: 1990 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura004_04.html", startYear: 1991, endYear: 2000 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura004_05.html", startYear: 2001, endYear: 2010 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura004_06.html", startYear: 2011, endYear: 2020 },
    { url: "https://www.data.jma.go.jp/sakura/data/sakura004_07.html", startYear: 2021, endYear: 2025 },
  ],
};

export const JMA_CURRENT_URLS = {
  bloom: "https://www.data.jma.go.jp/sakura/data/sakura_kaika.html",
  fullBloom: "https://www.data.jma.go.jp/sakura/data/sakura_mankai.html",
};

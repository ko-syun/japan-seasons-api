/**
 * JMA XML Atom feed parser for biological season observations.
 *
 * Feed URL: https://xml.kishou.go.jp/
 * The Atom feed contains entries for various weather events including
 * biological season observations (生物季節観測).
 *
 * This parser filters for sakura-related entries and extracts
 * bloom/full-bloom event data.
 */

export interface XmlObservation {
  locationName: string;
  eventType: "bloom" | "full_bloom";
  date: string; // ISO date
  publishedAt: string;
}

/**
 * Parse Atom feed XML for sakura observations.
 * Uses regex-based parsing since Workers lack DOMParser for XML.
 */
export function parseAtomFeed(xml: string): XmlObservation[] {
  const results: XmlObservation[] = [];

  // Extract entries
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let entryMatch;

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1];

    // Check if this is a sakura observation
    const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();

    // Filter for sakura-related entries
    if (!title.includes("さくら") && !title.includes("桜")) {
      continue;
    }

    const publishedMatch = entry.match(
      /<updated[^>]*>([\s\S]*?)<\/updated>/
    );
    const published = publishedMatch ? publishedMatch[1].trim() : "";

    // Determine event type from title
    const eventType = title.includes("満開") ? "full_bloom" : "bloom";

    // Extract location and date from content/summary
    const contentMatch = entry.match(
      /<content[^>]*>([\s\S]*?)<\/content>/
    );
    const content = contentMatch ? contentMatch[1].trim() : "";

    // Parse location from content (format varies)
    const locationMatch = content.match(
      /(?:地点|場所)[：:]?\s*([^\s<,]+)/
    );
    const locationName = locationMatch ? locationMatch[1] : "";

    // Parse date from content
    const dateMatch = content.match(
      /(\d{4})年(\d{1,2})月(\d{1,2})日/
    );
    if (dateMatch && locationName) {
      const year = dateMatch[1];
      const month = dateMatch[2].padStart(2, "0");
      const day = dateMatch[3].padStart(2, "0");

      results.push({
        locationName,
        eventType,
        date: `${year}-${month}-${day}`,
        publishedAt: published,
      });
    }
  }

  return results;
}

export const JMA_ATOM_FEED_URL =
  "https://www.data.jma.go.jp/developer/xml/feed/extra.xml";

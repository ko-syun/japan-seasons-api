import { describe, it, expect } from "vitest";
import {
  parseCurrentYearPage,
  parseHistoricalDecadePage,
} from "../../src/scrapers/jmaHtml.js";
import { parseJmaDate, diffDays, toMonthDay } from "../../src/scrapers/parser.js";

// Inline fixture HTML for Workers-compatible tests (no node:fs)

const BLOOM_HTML = `
<table border="1">
<tr><td>地点名</td><td>開花日</td></tr>
<tr><td>東京</td><td>3.20</td></tr>
<tr><td>横浜</td><td>3.22</td></tr>
<tr><td>大阪</td><td>3.25</td></tr>
<tr><td>京都</td><td>3.26</td></tr>
<tr><td>札幌</td><td>−</td></tr>
</table>`;

const HISTORICAL_HTML = `
<table border="1">
<tr><td>地点名</td><td>2021</td><td>2022</td><td>2023</td></tr>
<tr><td>東京</td><td>3.14</td><td>3.20</td><td>3.14</td></tr>
<tr><td>大阪</td><td>3.19</td><td>3.23</td><td>3.19</td></tr>
<tr><td>札幌</td><td>4.22</td><td>4.23</td><td>4.15</td></tr>
</table>`;

// ── Parser utilities ──

describe("parseJmaDate", () => {
  it("parses standard date format", () => {
    expect(parseJmaDate("3.20", 2026)).toBe("2026-03-20");
    expect(parseJmaDate("12.1", 2026)).toBe("2026-12-01");
  });

  it("returns null for empty/dash cells", () => {
    expect(parseJmaDate("", 2026)).toBeNull();
    expect(parseJmaDate("−", 2026)).toBeNull();
    expect(parseJmaDate("-", 2026)).toBeNull();
    expect(parseJmaDate("  ", 2026)).toBeNull();
  });

  it("handles single-digit months and days", () => {
    expect(parseJmaDate("1.5", 2026)).toBe("2026-01-05");
    expect(parseJmaDate("4.05", 2026)).toBe("2026-04-05");
  });
});

describe("diffDays", () => {
  it("calculates positive diff (later than normal)", () => {
    expect(diffDays("2026-04-01", "2026-03-25")).toBe(7);
  });

  it("calculates negative diff (earlier than normal)", () => {
    expect(diffDays("2026-03-18", "2026-03-25")).toBe(-7);
  });

  it("returns null when inputs are null", () => {
    expect(diffDays(null, "2026-03-25")).toBeNull();
    expect(diffDays("2026-03-25", null)).toBeNull();
  });
});

describe("toMonthDay", () => {
  it("extracts MM-DD from ISO date", () => {
    expect(toMonthDay("2026-03-20")).toBe("03-20");
    expect(toMonthDay("2025-12-01")).toBe("12-01");
  });

  it("returns null for null input", () => {
    expect(toMonthDay(null)).toBeNull();
  });
});

// ── Current year page parsing ──

describe("parseCurrentYearPage", () => {
  it("parses sample bloom page", () => {
    const results = parseCurrentYearPage(BLOOM_HTML, 2026);

    expect(results.length).toBeGreaterThan(0);

    const tokyo = results.find((r) => r.location_ja === "東京");
    expect(tokyo).toBeDefined();
    expect(tokyo!.month).toBe(3);
    expect(tokyo!.day).toBe(20);

    const sapporo = results.find((r) => r.location_ja === "札幌");
    expect(sapporo).toBeDefined();
    expect(sapporo!.month).toBeNull();
  });
});

// ── Historical decade page parsing ──

describe("parseHistoricalDecadePage", () => {
  it("parses sample historical page", () => {
    const results = parseHistoricalDecadePage(HISTORICAL_HTML, 2021, 2023);

    expect(results.length).toBeGreaterThan(0);

    const tokyo2023 = results.find(
      (r) => r.location_ja === "東京" && r.year === 2023
    );
    expect(tokyo2023).toBeDefined();
    expect(tokyo2023!.month).toBe(3);
    expect(tokyo2023!.day).toBe(14);

    const sapporo2021 = results.find(
      (r) => r.location_ja === "札幌" && r.year === 2021
    );
    expect(sapporo2021).toBeDefined();
    expect(sapporo2021!.month).toBe(4);
    expect(sapporo2021!.day).toBe(22);
  });
});

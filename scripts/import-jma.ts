/**
 * One-off script to scrape JMA historical data and generate SQL for D1 import.
 * Run: npx tsx scripts/import-jma.ts > /tmp/jma-data.sql
 */

const PAGES = {
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

// Map Japanese station names to location IDs
const LOCATION_MAP: Record<string, string> = {
  "稚内": "wakkanai", "旭川": "asahikawa", "網走": "abashiri", "札幌": "sapporo",
  "帯広": "obihiro", "釧路": "kushiro", "室蘭": "muroran", "函館": "hakodate",
  "青森": "aomori", "秋田": "akita", "盛岡": "morioka", "仙台": "sendai",
  "山形": "yamagata", "福島": "fukushima", "水戸": "mito", "宇都宮": "utsunomiya",
  "前橋": "maebashi", "熊谷": "kumagaya", "東京": "tokyo", "横浜": "yokohama",
  "銚子": "choshi", "長野": "nagano", "甲府": "kofu", "新潟": "niigata",
  "富山": "toyama", "金沢": "kanazawa", "福井": "fukui", "静岡": "shizuoka",
  "名古屋": "nagoya", "岐阜": "gifu", "津": "tsu", "彦根": "hikone",
  "京都": "kyoto", "奈良": "nara", "大阪": "osaka", "和歌山": "wakayama",
  "神戸": "kobe", "岡山": "okayama", "広島": "hiroshima", "鳥取": "tottori",
  "松江": "matsue", "下関": "shimonoseki", "山口": "yamaguchi", "高松": "takamatsu",
  "松山": "matsuyama", "徳島": "tokushima", "高知": "kochi", "福岡": "fukuoka",
  "大分": "oita", "佐賀": "saga", "長崎": "nagasaki", "熊本": "kumamoto",
  "宮崎": "miyazaki", "鹿児島": "kagoshima", "種子島": "tanegashima",
  "奄美": "amami", "那覇": "naha", "南大東島": "minamidaito",
  "宮古島": "miyakojima", "石垣島": "ishigaki",
};

interface Observation {
  locationId: string;
  year: number;
  month: number;
  day: number;
}

function parsePreText(html: string, startYear: number, endYear: number): Observation[] {
  const results: Observation[] = [];

  // Extract text from <pre> tags
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/gi);
  if (!preMatch) return results;

  for (const preBlock of preMatch) {
    const text = preBlock.replace(/<[^>]+>/g, "");
    const lines = text.split("\n");

    const numYears = endYear - startYear + 1;

    for (const line of lines) {
      // Skip header lines, empty lines
      if (!line.trim()) continue;
      if (line.includes("地点名") || line.includes("月 日")) continue;

      // Extract station name (first few characters, Japanese)
      const stationMatch = line.match(/^([^\s*]+)/);
      if (!stationMatch) continue;

      const stationName = stationMatch[1].trim();
      const locationId = LOCATION_MAP[stationName];
      if (!locationId) continue;

      // Remove the station name and the * marker, get the rest
      const dataPartRaw = line.replace(/^[^\s*]+\s*\*?\s*/, "");

      // Parse month-day pairs: each year has "M  D" or "-" or spaces
      // Split into fixed-width columns (each year takes ~7 chars: " MM DD ")
      // But the last columns are 平年値 and 代替種目 which we skip
      const dataPart = dataPartRaw.replace(/\s+$/, "");

      // Use regex to find all month-day pairs in sequence
      // Pattern: digits for month, whitespace, digits for day
      const pairs: Array<{ month: number; day: number } | null> = [];

      // Strategy: split remaining text by looking at fixed positions
      // Each year column is roughly 7 chars wide
      let pos = 0;
      const yearValues: string[] = [];

      // Try to extract numYears + 1 (for 平年値) + 1 (for 代替種目) groups
      // Each group is either "M  D" or "  -  " or spaces
      const groupRegex = /(\d{1,2}\s+\d{1,2}|\s*-\s*|\s{5,7})/g;
      let match: RegExpExecArray | null;

      while ((match = groupRegex.exec(dataPart)) !== null) {
        yearValues.push(match[1].trim());
        if (yearValues.length >= numYears + 1) break; // +1 for 平年値
      }

      // Process only the year columns (skip 平年値)
      for (let i = 0; i < Math.min(yearValues.length, numYears); i++) {
        const val = yearValues[i];
        if (!val || val === "-" || val === "") continue;

        const parts = val.trim().split(/\s+/);
        if (parts.length === 2) {
          const month = parseInt(parts[0], 10);
          const day = parseInt(parts[1], 10);
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            results.push({
              locationId,
              year: startYear + i,
              month,
              day,
            });
          }
        }
      }
    }
  }

  return results;
}

async function main() {
  const allBloom: Observation[] = [];
  const allFullBloom: Observation[] = [];

  // Fetch bloom pages
  for (const page of PAGES.bloom) {
    process.stderr.write(`Fetching bloom ${page.startYear}-${page.endYear}...\n`);
    const res = await fetch(page.url, {
      headers: { "User-Agent": "JapanSeasonsAPI/1.0 (data import)" },
    });
    const html = await res.text();
    const obs = parsePreText(html, page.startYear, page.endYear);
    allBloom.push(...obs);
    // Be polite
    await new Promise((r) => setTimeout(r, 500));
  }

  // Fetch full bloom pages
  for (const page of PAGES.fullBloom) {
    process.stderr.write(`Fetching full_bloom ${page.startYear}-${page.endYear}...\n`);
    const res = await fetch(page.url, {
      headers: { "User-Agent": "JapanSeasonsAPI/1.0 (data import)" },
    });
    const html = await res.text();
    const obs = parsePreText(html, page.startYear, page.endYear);
    allFullBloom.push(...obs);
    await new Promise((r) => setTimeout(r, 500));
  }

  process.stderr.write(`\nBloom observations: ${allBloom.length}\n`);
  process.stderr.write(`Full bloom observations: ${allFullBloom.length}\n`);

  // Generate SQL
  console.log("-- JMA Historical Sakura Data Import");
  console.log("-- Generated: " + new Date().toISOString());
  console.log("");

  // Bloom dates
  for (const obs of allBloom) {
    const date = `${obs.year}-${String(obs.month).padStart(2, "0")}-${String(obs.day).padStart(2, "0")}`;
    console.log(
      `INSERT INTO sakura_observations (location_id, year, bloom_date, source, updated_at) ` +
      `VALUES ('${obs.locationId}', ${obs.year}, '${date}', 'jma', datetime('now')) ` +
      `ON CONFLICT(location_id, year, source) DO UPDATE SET bloom_date = '${date}', updated_at = datetime('now');`
    );
  }

  // Full bloom dates
  for (const obs of allFullBloom) {
    const date = `${obs.year}-${String(obs.month).padStart(2, "0")}-${String(obs.day).padStart(2, "0")}`;
    console.log(
      `INSERT INTO sakura_observations (location_id, year, full_bloom_date, source, updated_at) ` +
      `VALUES ('${obs.locationId}', ${obs.year}, '${date}', 'jma', datetime('now')) ` +
      `ON CONFLICT(location_id, year, source) DO UPDATE SET full_bloom_date = '${date}', updated_at = datetime('now');`
    );
  }
}

main().catch(console.error);

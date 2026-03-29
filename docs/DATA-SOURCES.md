# Data Sources & Legality — Japan Seasons API

**Author:** Rin (CTO, KoS LLC)
**Date:** 2026-03-29

---

## 1. Primary Data Sources

### 1.1 気象庁 生物季節観測 (JMA Biological Season Observations)

**URL:** https://www.data.jma.go.jp/sakura/data/index.html

**What it provides:**
- Sakura bloom dates (開花日) and full-bloom dates (満開日) for ~58 observation stations
- Maple leaf color-change dates (かえでの紅葉日) and leaf-fall dates (落葉日)
- Other seasonal observations (plum, hydrangea, ginkgo, etc.)
- Historical data back to 1953
- Updated daily at ~08:35 JST during season

**Data format:** HTML tables on JMA website. No JSON/CSV API exists.

**Scraping approach:**
- Pages are static HTML tables with consistent structure
- Parse with `cheerio` or regex (tables are simple `<td>` grids)
- Key pages:
  - Current year bloom: `https://www.data.jma.go.jp/sakura/data/sakura_kaika.html`
  - Current year full bloom: `https://www.data.jma.go.jp/sakura/data/sakura_mankai.html`
  - Historical (decade buckets): `https://www.data.jma.go.jp/sakura/data/sakura003_06.html` etc.
  - Kouyou: `https://www.data.jma.go.jp/sakura/data/phn_014.html`

**Legal status: ✅ CLEAR**
- JMA website content falls under **公共データ利用規約第1.0版** (Government Open Data License v1.0)
- Commercial use explicitly permitted
- **Requirement:** Source attribution — "Data sourced from Japan Meteorological Agency (気象庁)"
- Reference: https://www.jma.go.jp/jma/kishou/info/coment.html
- Direct quote: *「権利表記の記載がない限り『公共データ利用規約第1.0版）』に準拠した利用条件の下で、利用することができます」*

**Rate limiting considerations:**
- JMA asks to avoid excessive access
- Our approach: Daily cron (1-2 requests/day during season), cache everything in D1
- Historical data: One-time bulk scrape, then stored permanently

### 1.2 気象庁 防災情報XML (JMA Disaster Prevention Information XML)

**URL:** https://xml.kishou.go.jp/

**What it provides:**
- Real-time biological season observation announcements as XML
- Machine-readable, structured format
- Push-based (Atom feed with entry per observation)

**Legal status: ✅ CLEAR**
- FAQ explicitly states: *「商用利用への制限はございません」* (No restrictions on commercial use)
- Reference: https://xml.kishou.go.jp/qanda.html

**Approach:**
- Poll Atom feed daily for new season observation entries
- Parse XML → extract bloom/color-change events
- More reliable than HTML scraping for real-time updates

### 1.3 NII 生物季節観測データベース (AGORA)

**URL:** https://agora.ex.nii.ac.jp/cps/weather/season/

**What it provides:**
- Structured database of JMA biological season observations
- Historical front-line maps
- Clean data derived from JMA XML feed

**Legal status: ⚠️ CHECK REQUIRED**
- Academic project by National Institute of Informatics
- Data originates from JMA (which is open), but NII's specific terms need verification
- **Recommendation:** Use as validation/cross-reference only; primary source should be JMA directly

## 2. Forecast Data Sources

### 2.1 日本気象協会 tenki.jp (Japan Weather Association)

**URL:** https://tenki.jp/sakura/expectation/

**What it provides:**
- Cherry blossom bloom forecast dates by city
- Updated multiple times during forecast season (Jan–April)
- Most widely cited forecast in Japan

**Legal status: ⚠️ NOT OPEN DATA**
- JWA is a private organization (一般財団法人)
- Website content is copyrighted
- **Cannot scrape for commercial redistribution without license**
- **Option:** Partner/license agreement, or use JMA official observations only (no forecasts)

### 2.2 ウェザーニュース (Weathernews)

**URL:** https://weathernews.jp/sakura/

**What it provides:**
- Independent sakura forecast (often differs from JWA)
- Citizen science reports from app users

**Legal status: ❌ PROPRIETARY**
- Weathernews Inc. is a commercial weather company
- Data is proprietary
- Cannot use without commercial license

### 2.3 日本気象株式会社 (Japan Weather Corp / n-kishou)

**URL:** https://n-kishou.com/corp/news-contents/sakura/

**Legal status: ❌ PROPRIETARY**
- Commercial weather company
- Same restrictions as Weathernews

### 2.4 Weathermap (sakura.weathermap.jp)

**URL:** https://sakura.weathermap.jp/en.php

**What it provides:**
- Sakura forecast with English page
- Good reference for our own English naming conventions

**Legal status: ❌ PROPRIETARY**

## 3. Festival/Matsuri Data Sources

### 3.1 自治体オープンデータ (Municipal Open Data)

**Various URLs:**
- Tokyo: https://portal.data.metro.tokyo.lg.jp/
- Each prefecture/city has its own open data portal

**What it provides:**
- Event/festival listings (varies by municipality)
- Some in CSV/JSON format

**Legal status: ✅ MOSTLY CLEAR**
- Most municipal open data is CC-BY or equivalent
- Need to check each municipality's specific terms
- Attribution required

### 3.2 観光庁 (Japan Tourism Agency)

**URL:** https://www.mlit.go.jp/kankocho/

**What it provides:**
- Tourism statistics, event listings
- Some structured data available

**Legal status: ✅ GOVERNMENT DATA**
- Same public data license as JMA

### 3.3 OH!MATSURi / matsuri-no-hi.com

**What it provides:**
- Comprehensive festival database
- User-contributed content

**Legal status: ❌ PROPRIETARY**
- Private website, copyrighted content
- Would need partnership agreement
- **Not suitable as primary data source**

### 3.4 Manual Curation (KoS)

**Approach for Phase 3:**
- Start with a curated dataset of top 200 festivals
- Structured manually from multiple public sources (tourism board press releases, Wikipedia, government tourism pages)
- Enriched with lat/lon, English descriptions, categories
- Facts (dates, locations) are not copyrightable; only creative expression is

## 4. Legal Summary

| Source | Type | Commercial OK | Attribution | Notes |
|--------|------|:---:|---|---|
| JMA Website | Government | ✅ | Required | Primary source for sakura/kouyou |
| JMA XML Feed | Government | ✅ | Required | Real-time observation data |
| Municipal OD | Government | ✅ | Required | Festival data (varies by city) |
| Tourism Agency | Government | ✅ | Required | Tourism statistics |
| tenki.jp (JWA) | Private | ❌ | — | Need license for forecasts |
| Weathernews | Private | ❌ | — | Cannot use |
| Weathermap | Private | ❌ | — | Cannot use |
| OH!MATSURi | Private | ❌ | — | Cannot use |

## 5. Data Strategy

### Phase 1 (Sakura MVP): JMA Only

- **Observations (actual dates):** JMA HTML scraping + XML feed → ✅ Legal
- **Forecasts:** NOT available from JMA (they stopped publishing forecasts in 2010)
- **Workaround for forecasts:**
  1. Build our own simple forecast model using historical JMA data + temperature data
  2. Or: License forecast data from JWA (business development task)
  3. MVP: Ship with observations only, add "estimated window" based on historical averages

### Important Note: JMA Stopped Forecasting

気象庁は **2010年に桜の開花予想の発表を終了**しました。現在の「桜前線予想」は民間気象会社（日本気象協会、ウェザーニュース等）が独自に発表しています。

**Impact on our product:**
- We CAN provide: actual observation data (bloom/full-bloom dates), historical averages, current status
- We CANNOT provide (without license): predicted bloom dates for future
- **Opportunity:** Build our own forecast model. Historical data + temperature correlation = publishable original forecast. This becomes a competitive moat.

### Phase 2+: Build Proprietary Forecast Model

Using JMA open data:
1. Historical bloom dates (1953–present) for all 58 stations
2. Temperature data from JMA (also open data)
3. Apply Aono model (published academic research, freely usable) for bloom prediction
4. This creates **original forecast data** that we own

Reference: 青野靖之 (2003) "温度変換日数を用いたソメイヨシノの開花日の推定" — published, citable, not patented.

## 6. Attribution Requirements

Every API response must include:

```json
{
  "meta": {
    "attribution": "Observation data sourced from Japan Meteorological Agency (気象庁). https://www.data.jma.go.jp/sakura/data/",
    "license": "Based on government open data under Japan Public Data License v1.0"
  }
}
```

Website/documentation must include:
- Clear attribution to JMA as data source
- Statement that we are not affiliated with JMA
- Link to original data source

---

*Reviewed for legal compliance. Recommendation: Proceed with JMA government data only for Phase 1. Explore JWA licensing for forecast data as a Phase 2 business development task.*

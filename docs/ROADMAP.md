# Roadmap — Japan Seasons API

**Created:** 2026-03-29
**Owner:** Jun / KoS LLC

---

## Phase Plan

| Phase | Scope | Timeline | Status |
|-------|-------|----------|--------|
| **1** | Sakura (Cherry Blossom) API | 2 weeks | 🔨 In Progress |
| **2** | Kouyou (Autumn Foliage) API | +2 weeks | 📋 Planned |
| **3** | Matsuri (Festival) API | +3 weeks | 📋 Planned |
| **4** | MCP Server | +1 week | 📋 Planned |
| **5** | Dashboard + Stripe Billing | +2 weeks | 📋 Planned |

**Total: ~10 weeks to full product**

---

## Phase 1: Sakura API (2 weeks)

気象庁の公開データ（58観測地点、1953年〜現在）を英語JSON APIとして提供。

**Endpoints:**
- `GET /v1/sakura/status` — 現在の開花状況
- `GET /v1/sakura/forecast` — 開花予測（過去平均ベース）
- `GET /v1/sakura/historical` — 過去データ
- `GET /v1/sakura/locations` — 観測地点一覧
- `GET /v1/sakura/recommend` — 旅行タイミング提案

**Stack:** Cloudflare Workers + Hono + D1 + KV

**Key deliverables:**
- [ ] JMA HTMLスクレイパー
- [ ] 58地点の日英翻訳マップ
- [ ] 過去データ一括インポート
- [ ] 日次cronインジェスト（シーズン中）
- [ ] レート制限（Free: 100req/日）
- [ ] Cloudflare Workersデプロイ

## Phase 2: Kouyou API (+2 weeks)

紅葉前線データ。Phase 1と同じアーキテクチャ。

**Endpoints:**
- `GET /v1/kouyou/status`
- `GET /v1/kouyou/forecast`
- `GET /v1/kouyou/historical`
- `GET /v1/kouyou/locations`
- `GET /v1/kouyou/recommend`

**Data source:** 気象庁 かえでの紅葉日・落葉日

## Phase 3: Matsuri API (+3 weeks)

日本の祭り・イベント情報。自治体オープンデータ＋手動キュレーション。

**Endpoints:**
- `GET /v1/matsuri/search` — 地域・月・カテゴリで検索
- `GET /v1/matsuri/upcoming` — 直近30日のイベント
- `GET /v1/matsuri/{id}` — 個別詳細

**初期データ:** トップ200祭りを手動キュレーション

## Phase 4: MCP Server (+1 week)

全APIをMCPツールとしてラップ。Claude/GPTが直接利用可能に。

- Streamable HTTP transport
- Cloudflare Workerとしてデプロイ（`/mcp`エンドポイント）
- ツール: `get_sakura_forecast`, `get_sakura_status`, `recommend_sakura_timing`, `search_matsuri` 等

## Phase 5: Dashboard + Stripe Billing (+2 weeks)

セルフサービスのAPIキー管理と課金。

**Revenue tiers:**
| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 100 req/day, current year only |
| Pro | $29/mo | 10K req/day, historical data, webhooks |
| Enterprise | Custom | Unlimited, SLA |

---

## Future (Post-Launch)

- **独自予測モデル:** 青野モデル（学術論文）ベースで桜開花予測。過去70年データ+気温から。民間予報に依存しないオリジナルデータ = 競合優位
- **花火大会API:** 毎年7000+件
- **リアルタイムWebカメラ連携:** 混雑度・開花状況
- **多言語対応:** 中国語、韓国語（インバウンド上位）

---

## Infrastructure

- **GitHub:** <https://github.com/ko-syun/japan-seasons-api>
- **Hosting:** Cloudflare Workers (Free Plan)
- **Domain:** TBD
- **Monitoring:** Cloudflare Analytics + Discord webhook alerts

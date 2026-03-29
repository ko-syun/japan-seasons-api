# Implementation Plan: Japan Seasons API — Phase 1 (Sakura)

> spec: `docs/PHASE1-SPEC.md`
> 作成日: 2026-03-29
> ステータス: in-progress

---

## 技術スタック

- **Runtime:** Cloudflare Workers (Hono framework for routing)
- **Database:** Cloudflare D1 (SQLite at edge)
- **Cache:** Cloudflare KV (hot data for /status endpoint)
- **Language:** TypeScript (strict mode)
- **Test:** Vitest + Miniflare
- **Scraper:** cheerio (HTML parsing)

## プロジェクト構造（新規）

```
japan-seasons-api/
├── src/
│   ├── index.ts                 ← Hono app entry + routing
│   ├── routes/
│   │   ├── status.ts            ← GET /v1/sakura/status
│   │   ├── forecast.ts          ← GET /v1/sakura/forecast
│   │   ├── historical.ts        ← GET /v1/sakura/historical
│   │   ├── locations.ts         ← GET /v1/sakura/locations
│   │   └── recommend.ts         ← GET /v1/sakura/recommend
│   ├── middleware/
│   │   ├── auth.ts              ← API key validation
│   │   ├── rateLimit.ts         ← KV-based rate limiting
│   │   └── cors.ts              ← CORS headers
│   ├── data/
│   │   ├── locations.ts         ← 58 JMA station metadata (static map)
│   │   └── regions.ts           ← Region/prefecture mapping
│   ├── scrapers/
│   │   ├── jmaHtml.ts           ← HTML table scraper (bloom/full-bloom pages)
│   │   ├── jmaXml.ts            ← XML Atom feed parser
│   │   └── parser.ts            ← Shared parsing utilities
│   ├── services/
│   │   ├── sakuraService.ts     ← Business logic (queries, calculations)
│   │   └── cacheService.ts      ← KV cache read/write
│   ├── db/
│   │   ├── schema.sql           ← D1 table definitions
│   │   └── seed.sql             ← Location master data seed
│   ├── scripts/
│   │   └── importHistorical.ts  ← One-time historical data import
│   └── types.ts                 ← Shared TypeScript types
├── test/
│   ├── fixtures/                ← Sample JMA HTML/XML for testing
│   ├── scrapers/
│   │   └── jmaHtml.test.ts
│   ├── routes/
│   │   ├── status.test.ts
│   │   ├── forecast.test.ts
│   │   ├── historical.test.ts
│   │   └── recommend.test.ts
│   └── middleware/
│       └── rateLimit.test.ts
├── wrangler.toml
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 設計方針

### 主要な設計判断

| 判断 | 選択 | 理由 | 却下した代替案 |
|---|---|---|---|
| フレームワーク | Hono | Workers最適化済み、型安全、軽量 | itty-router（機能不足）, Express（Workers非対応） |
| HTMLパース | cheerio | 安定、Workers対応 | regex（保守性最悪）, linkedom（メモリ重い） |
| テスト | Vitest + Miniflare | Workers公式推奨、D1/KVモック内蔵 | Jest（Miniflare統合が面倒） |
| historical import | D1 batch insert | 一度きり、速度重要 | CSV import（D1非対応） |

### リスク

| リスク | 影響度 | 対策 |
|---|---|---|
| JMA HTML構造変更 | 高 | fixture-based test + Discord webhook通知 |
| D1 row limit (500MB free) | 低 | 58 stations × 73 years ≈ 4,200行。余裕 |
| Scraper IP ban | 中 | リクエスト間隔、UA設定、fallback |
| Workers CPU time limit | 低 | Historical importはバッチ分割 |

---

## タスク分解

### Phase 1: プロジェクトセットアップ
- [ ] Task 1: `wrangler init` + wrangler.toml設定（D1, KV, cron triggers）
- [ ] Task 2: package.json + tsconfig.json + vitest.config.ts
- [ ] Task 3: Hono app scaffolding（index.ts + route stubs）

### Phase 2: データ基盤
- [ ] Task 4: D1スキーマ定義 + マイグレーション
- [ ] Task 5: 58 JMA station location data（static map + seed SQL）
- [ ] Task 6: JMA HTMLスクレイパー実装 + fixture tests
- [ ] [P] Task 7: JMA XMLフィードパーサー実装 + tests

### Phase 3: APIエンドポイント実装
- [ ] Task 8: middleware（auth, rateLimit, cors）
- [ ] Task 9: GET /v1/sakura/locations
- [ ] Task 10: GET /v1/sakura/status
- [ ] Task 11: GET /v1/sakura/historical
- [ ] Task 12: GET /v1/sakura/forecast（historical average method）
- [ ] Task 13: GET /v1/sakura/recommend

### Phase 4: データパイプライン
- [ ] Task 14: Historical data import script（1953-2025）
- [ ] Task 15: Daily cron worker（scrape + upsert + cache update）

### Phase 5: テスト・仕上げ
- [ ] Task 16: Integration tests（全エンドポイント）
- [ ] Task 17: Verification Loop実行
- [ ] Task 18: Kimiレビュー

### Phase 6: デプロイ
- [ ] Task 19: Staging deploy + smoke test
- [ ] Task 20: retro実施 → instinct蓄積

---

## テスト戦略

| テスト種別 | 対象 | 方法 |
|---|---|---|
| ユニットテスト | scraper parsing, date計算, rate limit logic | Vitest |
| 結合テスト | API endpoints + D1 queries | Vitest + Miniflare |
| fixtureテスト | JMA HTML/XML変更検知 | stored HTML + snapshot |

---

## Success Criteria（PHASE1-SPEC.mdより）

1. 5エンドポイントが全58 JMA stationで正しいデータを返す
2. 1953年〜現在の歴史データがロード済み
3. Daily cronが正常にデータ取り込み
4. Rate limiting正常動作
5. Edge response < 100ms
6. テスト全パス

---

> [P] マーカー: 並列実行可能なタスク
> Phase順序: 前のPhase完了まで後続はブロック。同Phase内の[P]タスクは並列可

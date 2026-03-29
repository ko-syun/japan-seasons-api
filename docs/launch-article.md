# AIエージェントが1セッションで作ったAPI SaaS — Japan Seasons API の全記録

## TL;DR

- 日本の桜🌸・紅葉🍁・祭り🏮のデータを提供するREST APIを作った
- 気象庁の73年分のデータを英語JSONで提供
- MCP対応でClaude/GPTから直接呼べる
- 設計からデプロイ、LP、Stripe課金、SEOまで**1セッション（約5時間）で完成**
- Cloudflare Workers（無料プラン）で運用コストほぼゼロ

**URL:** https://jpseasons.dokos.dev

---

## なぜ作ったのか

「3月末に京都行くけど、桜見れる？」

この質問に答えるデータは気象庁にある。でも：
- 日本語のみ
- HTMLテーブルやPDF
- APIなし
- AIエージェントが直接使えない

**英語のJSON APIにして、世界中のAIエージェントから使えるようにしたかった。**

インバウンド旅行者向けAIアシスタントの需要は確実にある。その基盤データとして。

---

## 何ができるか

### 🌸 桜API（Sakura）
- 全国57地点の開花状況（リアルタイム）
- 過去73年分の開花日データ（1953年〜）
- 統計的な開花予測（30年平均ベース）
- 旅行タイミングのレコメンド

```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://jpseasons.dokos.dev/v1/sakura/recommend?city=kyoto&dates=2026-03-28/2026-04-05"
```

レスポンス例：
```json
{
  "likelihood": "high",
  "confidence": 0.95,
  "summary": "Kyoto typically reaches full bloom in April. Your travel dates have a high probability of overlapping with peak cherry blossom viewing."
}
```

### 🍁 紅葉API（Kouyou）
桜と同じ構造で、53地点の紅葉データを提供。

### 🏮 祭りAPI（Matsuri）
50+の有名な祭りを検索。地域・月・カテゴリでフィルタ可能。

### 🤖 MCP Server
Claude DesktopやAIエージェントからTools経由で直接呼び出し:
```json
{
  "mcpServers": {
    "japan-seasons": {
      "url": "https://jpseasons.dokos.dev/mcp"
    }
  }
}
```
10個のToolsを公開。認証不要。

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| ランタイム | Cloudflare Workers (Free plan) |
| フレームワーク | Hono v4 |
| DB | Cloudflare D1 (SQLite) |
| キャッシュ | Cloudflare KV |
| 認証 | Web Crypto API (PBKDF2 + HMAC JWT) |
| 課金 | Stripe Checkout + Customer Portal |
| テスト | Vitest + Miniflare (66テスト) |
| MCP | @modelcontextprotocol/sdk |
| 言語 | TypeScript (strict mode) |

**運用コスト: $0/月**（Cloudflare Free Plan）

---

## 開発プロセス

### AIエージェント主導の開発

全フェーズをAIエージェント（Claude Opus 4）が実装:

1. **Phase 1: 桜API** — 5エンドポイント + JMAスクレイパー + テスト
2. **Phase 2: 紅葉API** — Phase 1のパターンをコピー
3. **Phase 3: 祭りAPI** — 50祭りのキュレーション + 検索API
4. **Phase 4: MCPサーバー** — 10 Tools
5. **Phase 5: Dashboard + Stripe** — 認証、APIキー管理、課金

Phase 2-4は**並列実行**（3サブエージェント同時稼働）。

### 品質管理パイプライン

```
実装 → Verification Loop（型チェック・テスト・セキュリティスキャン）
     → Kimiレビュー（Moonshot K2.5で3バッチ並列）
     → 指摘修正 → Round 2 LGTM
```

Kimiレビューでの主要指摘：
- タイミング攻撃対策（PBKDF2、Stripe webhook署名の定時間比較）
- 存在しないエンドポイント参照
- ハードコードされたシークレット

全部修正してLGTMもらってからデプロイ。

### AI SEO

- `llms.txt` — AI検索エンジン向けのAPI仕様サマリー
- `/.well-known/ai-plugin.json` — ChatGPTプラグインディスカバリ
- JSON-LD構造化データ
- robots.txtでAIクローラー明示許可

---

## 数字で見る

| 項目 | 数値 |
|------|------|
| 実装時間 | 約5時間（1セッション） |
| コード行数 | 5,700行 |
| テスト数 | 66 |
| 桜データ | 57地点 × 73年 = 4,000+レコード |
| 祭りデータ | 50件 |
| MCPツール | 10 |
| 月額運用コスト | $0 |

---

## 収益モデル

| プラン | 価格 | 制限 |
|--------|------|------|
| Free | $0 | 100リクエスト/日 |
| Pro | $29/月 | 10Kリクエスト/日 + 過去データ |
| Enterprise | 要相談 | 100K/日 + SLA |

ターゲット: 旅行系AIエージェント開発者、インバウンド旅行アプリ開発者

---

## 公開チャネル

- **LP:** https://jpseasons.dokos.dev
- **GitHub:** https://github.com/ko-syun/japan-seasons-api
- **Smithery:** https://smithery.ai/servers/ko-syun/japan-seasons
- **clawhub:** `clawhub install japan-seasons`
- **MCP:** `https://jpseasons.dokos.dev/mcp`

---

## まとめ

AIエージェントの時代に、「日本の季節」という普遍的なデータをAPI化した。

技術的にはCloudflare Workers無料プランで完結する、極めてローコストなアーキテクチャ。AIエージェントが設計からデプロイまで1セッションで作り上げた事例としても面白いはず。

データは気象庁という信頼性の高いソースから。73年分の桜データが示す「10年ごとに2日ずつ早まる開花」というトレンドは、気候変動を数字で実感できる。

Free tierで誰でも使えるので、ぜひ触ってみてください。

---

*Built by KoS LLC / Jun Gu*
*@kossssss888*

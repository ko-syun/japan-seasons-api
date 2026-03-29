# X (Twitter) 告知文案

## メインツイート（日本語）

🌸🍁🏮 Japan Seasons API をリリースしました

日本の桜・紅葉・祭りデータを提供するREST API。

- 🌸 桜の開花予測（57地点・73年分の実データ）
- 🍁 紅葉の見頃予測（53地点）
- 🏮 50+の祭り検索（地域・月・カテゴリ）
- 🤖 MCP対応（Claude/GPTから直接呼び出し可能）

Free: 100リクエスト/日
ドキュメント・登録 → https://jpseasons.dokos.dev

気象庁の公開データを英語JSONで。
AIエージェント × 日本の季節情報の架け橋に。

#API #桜 #紅葉 #MCP #IndieHacker #個人開発

---

## English version

🌸🍁🏮 Launched: Japan Seasons API

REST API for Japanese seasonal data — cherry blossom forecasts, autumn foliage tracking & festival search.

- 57 JMA stations, 73 years of bloom data
- MCP server for AI agent integration
- Free tier: 100 req/day

Perfect for travel apps, AI agents, or anyone curious about when to visit Japan.

https://jpseasons.dokos.dev

#API #Japan #CherryBlossom #MCP #BuildInPublic

---

## スレッド用（技術詳細）

### 2/n
技術スタック:
- Cloudflare Workers + Hono + D1 + KV
- TypeScript strict mode
- Stripe課金（Free / Pro $29/mo）
- 66テスト（Vitest + Miniflare）
- LGTMまでKimiレビュー2ラウンド

全部AIエージェント（Claude Opus）が実装。
設計→実装→テスト→レビュー→デプロイ→LP→SEOまで1セッション。

### 3/n
MCP対応がポイント。

Claude Desktopの設定に1行追加するだけ:
```json
{ "mcpServers": { "japan-seasons": { "url": "https://jpseasons.dokos.dev/mcp" } } }
```

「京都に3月末に行くけど桜見れる？」→ AIが直接APIを叩いて回答。

### 4/n
データソース:
気象庁（JMA）が1953年から記録している桜の開花日・満開日データ。

東京の桜:
- 最も早い開花: 3/14（2023年）
- 最も遅い開花: 4/11（1984年）
- 平均: 3/26
- トレンド: 10年ごとに約2日ずつ早まっている

気候変動が数字で見える。

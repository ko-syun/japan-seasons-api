# WHITEBOARD — Japan Seasons API Phase 1 (Sakura)

## ルール

- **Goal**: 日本の桜開花データを世界のAIエージェントに提供するREST APIをCloudflare Workers上で稼働させる
- **関係者**:
  - PM（Rin） — 設計、タスク管理、レビュー統括
  - FE（Coding Agent） — 実装担当
  - QA（Kimi） — コードレビュー、品質チェック
- **掲示板ルール**:
  - 書き込むのはRin（PM）だけ
  - タスク完了時にも記録する

---

## 掲示板

- [PM] プロジェクト開始: 2026-03-29
- [PM] IMPLEMENTATION-PLAN.md 作成完了
- [PM] 設計ドキュメント（Kuro作成）確認完了: README, DESIGN.md, PHASE1-SPEC.md, DATA-SOURCES.md
- [PM] 実装完了: Hono + D1 + KV フルスタック
- [PM] テスト 24/24 通過（scrapers/routes/middleware）
- [PM] バグ修正: ExecutionContext getter, SQLエイリアス(l.id→id), テスト分離
- [PM] Verification Loop完了 → verification-report.md作成
- [PM] Kimiレビュー完了（Round 2でLGTM）
  - Round 1: 🔴3件 🟡11件 🟢6件 → 全critical/warning修正
  - Round 2: LGTM ✅
- [PM] GitHub push完了: <https://github.com/ko-syun/japan-seasons-api>
- [PM] Phase 2 紅葉API完了: 5エンドポイント + 53地点 + 11テスト
- [PM] Phase 3 祭りAPI完了: 3エンドポイント + 50祭り + 14テスト
- [PM] Phase 4 MCPサーバー完了: 10ツール + Streamable HTTP
- [PM] Phase 5 Dashboard+Stripe完了: 認証 + APIキー管理 + 課金 + 17テスト
- [PM] 全Phase デプロイ完了: 66テスト全通過
- [制約] Cloudflare Workers CPU time: 10ms (free) / 50ms (paid) — historical importはバッチ分割必須
- [制約] D1 batch insert: 最大100行/バッチ
- [制約] JMAスクレイピング: robots.txtに明示的禁止なし（DATA-SOURCES.md確認済み）、ただし礼儀として間隔を置く

---

## 技術制約

- TypeScript strict mode必須
- Hono v4.x 使用
- Cloudflare Workers runtime（Node.js APIは使えない）
- D1はSQLite互換だが一部制約あり（RETURNING句の制限等）
- KV eventual consistency — cacheの即時反映は保証しない

---

## NC（未確定事項）

- NC-001: ✅ Cloudflare Free plan（Workers free tier: CPU 10ms, 100K req/day）
- NC-002: ドメイン未取得 → Phase 1ではworkers.devサブドメインで運用
- NC-003: ✅ GitHub repo: https://github.com/ko-syun/japan-seasons-api

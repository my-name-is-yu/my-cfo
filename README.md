# My CFO

![My CFO Screenshot](./%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202026-04-07%2016.32.08.png)

「学生向けパーソナルAI CFO」をテーマにしたハッカソン実装です。  
一人暮らしの大学生に対して、現在の家計把握、クレジットカード比較、旅行などの大きな支出の意思決定を、OpenClaw ベースの AI アシスタントとして支援します。

## What It Solves

一人暮らしの学生は、収入が限られる一方で、家賃、日常支出、サブスク、留学準備など複数の意思決定を同時に抱えます。  
My CFO は、単なる家計簿ではなく、学生のプロフィールと今後の予定を踏まえて「今の自分に合うお金の判断」を返す AI アシスタントです。

## Try It Now

提出・審査ではローカルではなく、以下のデプロイ済み URL を利用してください。

- Public App: `https://mycfo.zeabur.app/chat?session=main`
- WebSocket URL: `wss://mycfo.zeabur.app`

最短の確認手順:

1. デプロイ済み URL を開く
2. `自分の状況教えて` を実行する
3. `クレカ作りたい` を実行する
4. `9月にバンクーバー旅行行ける？` を実行する

確認できること:

- 学生プロフィールに基づく回答
- 月次収支テーブルと予算チャート
- カード比較と推薦理由
- What-If の runway 比較とリスク分類
- TiDB に保存される構造化データ

デモ前提のプロフィールは以下です。

- 東京の大学2年生、20歳
- 月収12万円（バイト8万 + 仕送り4万）
- 家賃6.5万円
- 最寄り駅は下北沢
- 来年春に短期留学予定
- コンビニ利用多め
- Netflix 1,490円 / Spotify 980円
- クレジットカード未保有
- 貯金30万円

## Demo URL

- Public App: `https://mycfo.zeabur.app/chat?session=main`
- WebSocket URL: `wss://mycfo.zeabur.app`

このプロジェクトは `localhost` 前提ではなく、Zeabur にデプロイ済みの公開 URL を前提にデモする構成です。

## Features

### 1. プロフィール & ファイナンシャルダッシュボード

- mem9 相当のプロフィールを取得
- 月次収支を要約
- 支出内訳チャートを表示
- TiDB の `monthly_cashflows` をもとに収支テーブルを表示

想定プロンプト:
`自分の状況教えて`

### 2. クレカ比較 + 学生キャンペーン探索

- プロフィールから学生属性、留学予定、コンビニ利用傾向を取得
- Bright Data で取得した体裁のカード情報を正規化
- TiDB の `scraped_card_offers` に保存
- 上位3枚を理由付きで提案

想定プロンプト:
`クレカ作りたい`

### 3. What-If 意思決定エンジン

- 旅行費用概算を取得
- 現在の収支から runway を計算
- 支出前後の runway を比較
- low / medium / high でリスク分類
- 貯金推移グラフと代替案を提示
- TiDB の `decision_runs` に保存

想定プロンプト:
`9月にバンクーバー旅行行ける？`

## Architecture

この実装は OpenClaw の考え方に寄せて構成しています。

- `config/soul.md`
  AI CFO の人格、判断基準、安全制約を定義
- `skills/*.md`
  ダッシュボード要約、カード推薦、What-If 判定の推論パターンを定義
- `src/server.js`
  最小 API と静的フロントエンド配信
- `src/services/*`
  プロフィール、ダッシュボード、カード推薦、旅行試算、What-If 分析のアプリケーション層
- `src/lib/tidb.js`
  TiDB Cloud 接続
- `src/services/tidb-service.js`
  live/demo フォールバックを持つデータアクセス層
- `public/*`
  1画面で結果確認できるデモ UI

外部サービスの位置づけは以下です。

- OpenClaw: 推論オーケストレーションの前提
- Agnes Claw: OpenAI 互換 LLM バックエンド想定
- mem9: 長期記憶の保存先想定
- Bright Data: カード情報と旅行費用の取得元想定
- TiDB Cloud: 構造化データ保存とベクトル検索
- Zeabur: デプロイ基盤

## Why This Is Interesting

- 学生向けに特化した CFO 体験で、一般的な家計アプリより意思決定支援に寄せている
- メモリ、構造化保存、外部データ取得を組み合わせて、単発QAではなく継続支援にしている
- クレカ比較と旅行判断の両方を、同じプロフィール・収支データから一貫して説明できる
- OpenClaw 風の `soul` と `skills` を分離し、推論方針をコード外でも追える

## Tech Stack

- Node.js 18+
- OpenClaw concepts
- TiDB Cloud
- mysql2
- Chart.js
- Zeabur

## Project Structure

```text
.
├── config/
│   ├── mcp-servers.json
│   └── soul.md
├── db/
│   ├── data/
│   ├── schema.sql
│   ├── tidb-cloud-bootstrap.sql
│   └── seeds/
├── public/
├── skills/
└── src/
```

主要ファイル:

- `src/server.js`: API と画面配信
- `src/services/dashboard-service.js`: 家計ダッシュボード生成
- `src/services/card-service.js`: クレカ比較ロジック
- `src/services/whatif-service.js`: runway とリスク判定
- `src/services/tidb-service.js`: TiDB / ローカルデータ切り替え
- `db/tidb-cloud-bootstrap.sql`: TiDB Cloud テーブル作成 SQL
- `db/seeds/tidb-demo-seed.sql`: TiDB Cloud デモデータ投入 SQL

## Deployment-First Setup

提出時の確認対象はデプロイ済みアプリです。

- Production URL: `https://mycfo.zeabur.app/chat?session=main`
- Hosting: Zeabur
- Database: TiDB Cloud

## Local Setup

```bash
npm install
npm start
```

ローカル起動は開発用の補助です。提出・審査では公開 URL を使用してください。

## Environment Variables

`.env.example` を参照してください。主な変数は以下です。

```env
HOST=0.0.0.0
PORT=3000
APP_BASE_URL=http://localhost:3000

USE_LIVE_MEM9=false
USE_LIVE_BRIGHTDATA=false
USE_LIVE_TIDB=false

TIDB_HOST=
TIDB_PORT=4000
TIDB_DATABASE=student_ai_cfo
TIDB_USER=
TIDB_PASSWORD=
TIDB_SSL_MODE=REQUIRED
```

補足:

- `USE_LIVE_TIDB=true` のとき TiDB Cloud を参照します
- `USE_LIVE_MEM9` と `USE_LIVE_BRIGHTDATA` は現状デモ切り替え用です
- live 未設定時はローカル JSON データで動作します

## TiDB Cloud Setup

### 1. テーブル作成

以下を TiDB Cloud SQL Editor で実行します。

- `db/tidb-cloud-bootstrap.sql`

作成される主なテーブル:

- `user_profiles`
- `monthly_cashflows`
- `scraped_card_offers`
- `travel_cost_cache`
- `decision_runs`
- `memory_embeddings`

### 2. デモデータ投入

以下を実行します。

- `db/seeds/tidb-demo-seed.sql`

## Zeabur Setup

Zeabur には最低限以下の環境変数を入れて再デプロイします。

```env
USE_LIVE_TIDB=true
TIDB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_DATABASE=student_ai_cfo
TIDB_USER=YOUR_USER
TIDB_PASSWORD=YOUR_PASSWORD
TIDB_SSL_MODE=REQUIRED

USE_LIVE_MEM9=false
USE_LIVE_BRIGHTDATA=false
```

OpenClaw Gateway Dashboard へ接続する場合:

- WebSocket URL: `wss://mycfo.zeabur.app`
- Gateway Token: Zeabur/OpenClaw 側で払い出されたものを使用

## Demo Flow

審査用のデモは以下の順番を想定しています。

1. `自分の状況教えて`
2. `クレカ作りたい`
3. `9月にバンクーバー旅行行ける？`

見せるポイント:

- プロフィールを踏まえて回答が変わる
- 金融判断が数字ベースで説明される
- 支出内訳と runway がグラフで見える
- スクレイピング想定データが TiDB に保存される
- 単発チャットではなく、意思決定支援の流れになっている

## Submission Notes

- 公開デモ URL あり
- public repository 前提で整理済み
- 機密値は環境変数管理
- デモ用プロフィールと SQL は同梱済み

## Current Implementation Status

実装済み:

- デプロイ済み URL でのデモ導線
- ローカルデータでの完全デモ
- TiDB Cloud テーブル作成 SQL
- TiDB Cloud への実接続コード
- クレカ比較結果の構造化保存
- 旅行 What-If 結果の保存
- ダッシュボード、比較表、チャート UI

未接続または簡略化している点:

- mem9 本番 API 連携
- Bright Data 本番スクレイピング
- Agnes Claw 本番推論接続
- OpenClaw のフルエージェントワークフロー統合

## Repository

提出用の公開リポジトリ名は `My CFO` を想定しています。

推奨リポジトリ名:

- `my-cfo`

## Notes

- 提出時点では、live 接続がなくてもローカルデータでデモ可能です
- TiDB / mem9 / Bright Data は段階的に実接続できる構成にしています
- 機密情報は README に直接書かず、Zeabur の環境変数で管理してください

## License

Hackathon prototype.

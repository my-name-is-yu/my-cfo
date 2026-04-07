# あなたが先に進める作業

このファイルは、Codex がローカル実装を進めている間に、あなたが外部サービス側で完了してほしい手順だけをまとめたものです。

## 優先度順

### 1. Zeabur プロジェクト作成

- Zeabur で新規プロジェクトを作成する
- このリポジトリを接続する
- クーポン `BUILDER0407` を適用する
- デプロイ対象サービスを 1 つで始める

### 2. Agnes Claw の接続情報を取得

- OpenAI 互換 API の `BASE_URL` を確認する
- API キーを発行する
- 以下を控える
  - `AGNES_CLAW_BASE_URL`
  - `AGNES_CLAW_API_KEY`

### 3. mem9 プロジェクト作成

- mem9 のプロジェクトを作る
- API キーを発行する
- 以下を控える
  - `MEM9_API_KEY`
  - `MEM9_PROJECT_ID`

### 4. TiDB Cloud Starter を作成

- TiDB Cloud で Starter クラスタを作る
- 接続情報を取得する
- 以下を控える
  - `TIDB_HOST`
  - `TIDB_PORT`
  - `TIDB_DATABASE`
  - `TIDB_USER`
  - `TIDB_PASSWORD`

### 5. Bright Data の API / MCP 情報を準備

- Bright Data の API キーを発行する
- MCP 連携 URL または呼び出し方法を確認する
- 以下を控える
  - `BRIGHTDATA_API_KEY`
  - `BRIGHTDATA_MCP_URL`

### 6. Zeabur 環境変数を設定

- まずは以下を登録する

```env
HOST=0.0.0.0
PORT=3000
APP_BASE_URL=<Zeabur公開URL>
USE_LIVE_MEM9=false
USE_LIVE_BRIGHTDATA=false
USE_LIVE_TIDB=false
AGNES_CLAW_BASE_URL=<取得した値>
AGNES_CLAW_API_KEY=<取得した値>
MEM9_API_KEY=<取得した値>
MEM9_PROJECT_ID=<取得した値>
TIDB_HOST=<取得した値>
TIDB_PORT=4000
TIDB_DATABASE=<取得した値>
TIDB_USER=<取得した値>
TIDB_PASSWORD=<取得した値>
BRIGHTDATA_API_KEY=<取得した値>
BRIGHTDATA_MCP_URL=<取得した値>
```

### 7. データベース初期化

- TiDB に接続して [schema.sql](/Users/yuyoshimuta/Documents/dev/Concept-Hackathon/TS26/db/schema.sql) を実行する
- 続けて [demo.sql](/Users/yuyoshimuta/Documents/dev/Concept-Hackathon/TS26/db/seeds/demo.sql) を実行する

### 8. mem9 にデモデータ注入

- ひとまず [demo-memory.json](/Users/yuyoshimuta/Documents/dev/Concept-Hackathon/TS26/db/data/demo-memory.json) の内容を元に投入する
- user id は `demo-user-001` に揃える

### 9. 公式サイトの疎通確認

- Bright Data で最低限この 3 系統が取れるか確認する
  - JCB かエポスのカードページ
  - カードキャンペーンページ
  - Skyscanner か Expedia の旅行費ページ

## 最後に知らせてほしいもの

- Zeabur の公開 URL
- 環境変数が入ったか
- TiDB 初期化が終わったか
- mem9 注入が終わったか
- Bright Data の疎通確認結果

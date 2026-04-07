# TEAMZ AI Hackathon メモ

更新日: 2026-04-07

## テーマ

- イベント名: `TEAMZ AI Hackathon | Build OpenClaw AI Assistant`
- 実質テーマ: `OpenClaw` というカスタマイズ可能な AI アシスタントを構築し、テストし、デプロイすること
- 補足:
  - 本番利用を意識した AI アシスタントをゼロから組み立てる形式
  - Luma の説明では、`OpenClaw` をベースに各種スポンサープロダクトを統合して実装するハッカソン

## 提出条件・参加条件

### デッキに明示されている条件

- 提出締切: `16:30`
- 提出物は `localhost` ではなく、`live deploy` されていること

### イベントページにある前提・条件

- 会場参加には 2 つの登録が必要
  - Luma イベントページでの参加登録
  - カンファレンスバッジ登録
- ノートPC持参推奨
- API / クラウドサービスの基礎知識があるとよい
- アイデア持参は任意だが推奨

### 実装上の期待値

- `OpenClaw` をベースにした動くプロダクトを作る
- 可能ならスポンサープロダクトを広く活用する
- デモ可能な状態まで仕上げる

## 審査基準

- `Completeness`
  - MVP として最低限の完成度があるか
- `Innovation`
  - アイデアや実装に新規性があるか
- `Real-life problem solving`
  - 実際の課題や市場のペインを解いているか
- `Sponsored product usage`
  - スポンサープロダクトを活用しているか

## 審査員

- Amber Liu — Director, SIG Asia Investment LLLP
- Yang Kecheng — AI Data Platform Engineer, CADDi
- Tadatoshi Sekiguchi — Senior Solution Architect, TiDB Japan

## 参考になるスタック情報

イベントページでは、以下のコンポーネント統合が想定されている:

- Zeabur: デプロイ基盤
- Agnes Claw / Agnes Claw Pro: LLM バックエンド
- Nosana: 分散 GPU
- Bright Data: Web ブラウジング / スクレイピング
- mem9: 長期記憶
- TiDB Cloud: 状態管理 / DB
- QoderWork: 開発ワークスペース

## 補助情報

- Wi-Fi: `TEAMZSUMMIT26`
- Password: `12345678`
- Zeabur code: `BUILDER0407`
- Submission: `https://tinyurl.com/openclawsubmit`
- Event page: `https://luma.com/teamzaihackathon`
- Tutorial: `https://tutorial.theaibuilders.dev/tutorials/Automation/openclaw`

## 今後の方針

今後このリポジトリでは、以下を前提として進める:

- `OpenClaw` 文脈から大きく外れない
- 16:30 までにライブデプロイ可能なスコープを優先する
- 審査基準 4 項目を常に意識する
- スポンサープロダクト活用を加点要素として扱う

## 出典

- Canva デッキ: `https://www.canva.com/design/DAHFSgCa7-A/Q9bdWuy78AfPneJjzZU5NQ/view`
- Luma イベントページ: `https://luma.com/teamzaihackathon`
- OpenClaw チュートリアル: `https://tutorial.theaibuilders.dev/tutorials/Automation/openclaw`

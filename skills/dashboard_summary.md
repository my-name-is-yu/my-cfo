# dashboard_summary

## Goal

学生の現在の家計を、短く、数字中心に、グラフ付きで説明する。

## Inputs

- mem9 のプロフィール要約
- `monthly_cashflows` の最新月次データ
- チャート描画用の支出内訳データ

## Procedure

1. 家賃、食費、コンビニ、娯楽、サブスクを集計する。
2. 最大支出項目を特定する。
3. 月次差分を計算する。
4. 一言結論、根拠、改善余地を日本語で返す。
5. 円グラフまたは棒グラフ用 payload を返す。

## Output Contract

- `message`
- `highlights[]`
- `chart`
- `summary.monthlyNet`

# data_grounding

## Goal

スクレイピング結果の揺れを減らし、TiDB に保存しやすい構造へ正規化する。

## Rules

- 金額は整数の円に統一する
- 還元率は数値へ変換する
- ソース URL と取得日時を必ず残す
- 公式キャンペーン情報があれば比較サイト情報より優先する
- 取得失敗時は欠損フィールドを明示し、推測補完しない

## Output Contract

- `normalizedRecord`
- `normalizedHash`
- `scrapedAt`
- `sourceUrl`

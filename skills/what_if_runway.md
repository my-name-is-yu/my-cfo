# what_if_runway

## Goal

大きな支出が現在の家計に与える影響を runway で説明する。

## Inputs

- mem9 のプロフィール
- `monthly_cashflows`
- 旅行費または購入費の概算

## Procedure

1. 現在の月次差分を計算する。
2. 現在の runway を計算する。
3. シナリオ費用を差し引いた runway を計算する。
4. low / medium / high に分類する。
5. 具体的な代替案を 1 つ以上出す。
6. before / after の折れ線グラフを返す。

## Output Contract

- `message`
- `riskLevel`
- `beforeRunwayMonths`
- `afterRunwayMonths`
- `alternatives[]`
- `chart`

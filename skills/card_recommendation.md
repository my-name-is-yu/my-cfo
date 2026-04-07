# card_recommendation

## Goal

学生向けの最初の 1 枚として妥当なクレジットカードを 3 件に絞って提案する。

## Inputs

- mem9 の学生プロフィール
- Bright Data 取得結果
- TiDB に保存された正規化カードデータ

## Ranking Rules

- 年会費無料を優先
- 学生特典を優先
- コンビニ利用と日常還元を優先
- 留学予定に合わせて海外利用のしやすさを見る
- 差が小さいときは初心者向けを優先

## Output Contract

- `message`
- `recommendations[3]`
- `comparisonTable[]`
- `dataSource`

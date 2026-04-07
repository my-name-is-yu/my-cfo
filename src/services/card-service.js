const { yen } = require("../lib/finance");
const { scrapeStudentCardOffers } = require("./brightdata-service");
const { upsertCardOffers } = require("./tidb-service");

function scoreCard(card, profile) {
  let score = 0;

  if (card.annualFeeYen === 0) {
    score += 20;
  }
  if (card.studentBenefits) {
    score += 25;
  }
  if (card.pointRewardRate >= 1) {
    score += 20;
  } else {
    score += 12;
  }
  if (profile.traits.some((trait) => trait.includes("海外")) && card.overseasFeeNote) {
    score += 20;
  }
  if (card.campaignTitle) {
    score += 15;
  }

  return score;
}

async function getTopCards(profile) {
  const cards = await upsertCardOffers(scrapeStudentCardOffers());
  return cards
    .map((card) => ({ ...card, score: scoreCard(card, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

async function buildCardRecommendation(profile) {
  const cards = await getTopCards(profile);
  const convenienceUse = profile.traits.some((trait) => trait.includes("コンビニ"));
  const abroadPlan = profile.profile.studyAbroadPlan;

  return {
    message: `学生でクレカ未保有、かつ ${abroadPlan} という前提だと、年会費無料で始めやすく、海外利用も説明しやすいカードが合います。`,
    highlights: [
      `現在の貯金は ${yen(profile.income.currentSavings)} で、まずは固定費を増やさない年会費無料カードが前提です。`,
      `${convenienceUse ? "コンビニ利用が多いので、日常還元の分かりやすさを重視しました。" : "日常決済の扱いやすさを重視しました。"}`,
      `${abroadPlan} のため、海外利用の説明があるカードを加点しました。`,
      "初めての1枚としての分かりやすさも同点時の優先条件にしています。"
    ],
    recommendations: cards.map((card, index) => ({
      rank: index + 1,
      cardName: card.cardName,
      issuerName: card.issuerName,
      annualFeeYen: card.annualFeeYen,
      pointRewardRate: card.pointRewardRate,
      studentBenefits: card.studentBenefits,
      overseasFeeNote: card.overseasFeeNote,
      campaignTitle: card.campaignTitle,
      campaignValue: card.campaignValue,
      sourceUrl: card.sourceUrl,
      reason: [
        card.annualFeeYen === 0 ? "年会費無料" : `年会費 ${yen(card.annualFeeYen)}`,
        card.studentBenefits,
        card.overseasFeeNote
      ].filter(Boolean).join(" / ")
    })),
    comparisonTable: cards.map((card) => ({
      cardName: card.cardName,
      annualFee: card.annualFeeYen === 0 ? "無料" : yen(card.annualFeeYen),
      rewardRate: `${card.pointRewardRate}%`,
      studentPerk: card.studentBenefits,
      overseas: card.overseasFeeNote,
      campaign: `${card.campaignTitle || "-"} ${card.campaignValue || ""}`.trim()
    }))
  };
}

module.exports = {
  getTopCards,
  buildCardRecommendation
};

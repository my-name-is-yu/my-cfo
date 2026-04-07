const { readJson } = require("../lib/file-store");
const { normalizeHash } = require("./tidb-service");

function scrapeStudentCardOffers() {
  const now = new Date().toISOString();

  return readJson("db/data/demo-cards.json").map((card) => ({
    sourceSite: card.sourceSite,
    sourceUrl: card.sourceUrl,
    scrapedAt: now,
    cardName: card.cardName,
    issuerName: card.issuerName,
    annualFeeYen: card.annualFeeYen,
    pointRewardRate: card.pointRewardRate,
    studentBenefits: card.studentBenefits,
    overseasFeeNote: card.overseasFeeNote,
    campaignTitle: card.campaignTitle,
    campaignValue: card.campaignValue,
    campaignExpiry: card.campaignExpiry,
    eligibilityNote: "学生でも検討しやすい初回カード候補",
    normalizedHash: normalizeHash({
      cardName: card.cardName,
      annualFeeYen: card.annualFeeYen,
      pointRewardRate: card.pointRewardRate,
      campaignTitle: card.campaignTitle
    })
  }));
}

function scrapeTravelEstimate(destination, travelMonth) {
  const cache = readJson("db/data/demo-travel.json");
  const key = `${destination}-${travelMonth}`;
  const record = cache[key];
  if (!record) {
    return null;
  }

  return {
    ...record,
    scrapedAt: new Date().toISOString()
  };
}

module.exports = {
  scrapeStudentCardOffers,
  scrapeTravelEstimate
};

const { monthlyNet, runwayMonths, riskLevel, yen } = require("../lib/finance");
const { saveDecisionRun } = require("./tidb-service");

function buildProjection(startSavings, monthlyNetValue, months, extraCostMonthIndex, extraCost) {
  const labels = [];
  const before = [];
  const after = [];

  let beforeBalance = startSavings;
  let afterBalance = startSavings;

  for (let i = 0; i < months; i += 1) {
    const month = 4 + i;
    labels.push(`2026-${String(month).padStart(2, "0")}`);
    before.push(beforeBalance);

    if (i === extraCostMonthIndex) {
      afterBalance -= extraCost;
    }
    after.push(afterBalance);

    beforeBalance += monthlyNetValue;
    afterBalance += monthlyNetValue;
  }

  return { labels, before, after };
}

async function analyzeTrip(profile, travelEstimate, travelLabel) {
  const net = monthlyNet(profile);
  const currentRunway = runwayMonths(profile.income.currentSavings, net);
  const savingsAfterTrip = profile.income.currentSavings - travelEstimate.totalEstimatedCostYen;
  const projectedRunway = runwayMonths(savingsAfterTrip, net);
  const level = riskLevel(projectedRunway);
  const projection = buildProjection(profile.income.currentSavings, net, 6, 5, travelEstimate.totalEstimatedCostYen);
  const riskText = level === "low" ? "十分" : level === "medium" ? "ややタイト" : "かなり厳しい";
  const monthlySaveTarget = Math.max(10000, Math.ceil((Math.max(6 - projectedRunway, 0) * Math.abs(net)) / 5 / 1000) * 1000);
  const record = await saveDecisionRun({
    userId: profile.userId,
    scenarioType: "travel",
    scenarioTitle: travelLabel,
    scenarioPayload: {
      destinationCity: travelEstimate.destinationCity,
      travelMonth: travelEstimate.travelMonth,
      totalEstimatedCostYen: travelEstimate.totalEstimatedCostYen
    },
    currentRunwayMonths: currentRunway,
    projectedRunwayMonths: projectedRunway,
    riskLevel: level,
    recommendationSummary: `月${yen(monthlySaveTarget || 10000)}を5ヶ月積み立てる`,
    chartPayload: projection
  });

  return {
    message: `${travelLabel} は実行可能ですが、旅行後の資金余力は ${riskText} です。`,
    beforeRunwayMonths: currentRunway,
    afterRunwayMonths: projectedRunway,
    riskLevel: level,
    estimateBreakdown: {
      flightCostYen: travelEstimate.flightCostYen,
      hotelCostYen: travelEstimate.hotelCostYen,
      localCostYen: travelEstimate.localCostYen,
      totalEstimatedCostYen: travelEstimate.totalEstimatedCostYen
    },
    highlights: [
      `旅行費の概算は ${yen(travelEstimate.totalEstimatedCostYen)} です。`,
      `現在の runway は約 ${currentRunway} ヶ月です。`,
      `旅行後の runway は約 ${projectedRunway} ヶ月です。`,
      `最大の重さは一時支出 ${yen(travelEstimate.totalEstimatedCostYen)} と毎月の赤字 ${yen(net)} です。`
    ],
    alternatives: [
      `月${yen(monthlySaveTarget || 10000)}を5ヶ月積み立てる`,
      "宿泊費を抑えて総額を3万円下げる",
      "旅行時期をオフピークにずらして航空券を圧縮する"
    ],
    chart: {
      type: "line",
      title: "Savings Runway Projection",
      labels: projection.labels,
      series: [
        { name: "Before Trip", values: projection.before },
        { name: "After Trip", values: projection.after }
      ]
    },
    decisionRun: record
  };
}

module.exports = {
  analyzeTrip
};

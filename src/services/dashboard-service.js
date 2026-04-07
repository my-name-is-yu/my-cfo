const { monthlyExpenseTotal, monthlyNet, yen } = require("../lib/finance");
const { getMemorySummary } = require("./memory-service");
const { getCashflowTable } = require("./cashflow-service");

function getLargestExpense(expenses) {
  const entries = [
    ["家賃", expenses.rent],
    ["食費", expenses.food],
    ["コンビニ", expenses.convenienceStore],
    ["交通費", expenses.transport],
    ["光熱費", expenses.utilities],
    ["通信費", expenses.phone],
    ["娯楽費", expenses.entertainment],
    ["サブスク", expenses.subscriptionsTotal],
    ["雑費", expenses.misc]
  ];

  return entries.sort((a, b) => b[1] - a[1])[0];
}

async function getDashboard(profile, latestCashflow, cashflows) {
  const totalExpenses = monthlyExpenseTotal(profile.expenses);
  const net = monthlyNet(profile);
  const [largestName, largestValue] = getLargestExpense(profile.expenses);
  const trend = cashflows.map((row) => row.savingsDelta);
  const improving = trend[trend.length - 1] > trend[0];
  const latestMonth = latestCashflow.targetMonth;
  const improvement = cashflows[0].convenienceStore - latestCashflow.convenienceStore;
  const budgetStatus = net >= 0 ? "黒字" : "赤字";
  const fixedCosts = profile.expenses.rent + profile.expenses.utilities + profile.expenses.phone + profile.expenses.subscriptionsTotal;
  const flexibleCosts = totalExpenses - fixedCosts;
  const memorySummary = getMemorySummary(profile);

  return {
    message: `あなたの直近家計は ${latestMonth} 時点で月 ${yen(Math.abs(net))} の${budgetStatus}です。最大コストは ${largestName} ${yen(largestValue)} です。`,
    highlights: [
      `${profile.profile.city}・${profile.profile.nearestStation} 周辺で一人暮らし中、月収は ${yen(profile.income.monthlyTotal)} です。`,
      `直近の月間支出は ${yen(totalExpenses)}、差分は ${net >= 0 ? "+" : ""}${yen(net)} です。`,
      `${largestName} が最大支出で、全体の負担感を決めています。`,
      `コンビニ支出は 4月比で ${yen(improvement)} 改善しており、日常コスト最適化は進んでいます。`,
      `貯金は ${yen(profile.income.currentSavings)} あり、急な出費への耐性はまだ残っています。`
    ],
    profileSummary: memorySummary,
    summary: {
      monthlyIncome: profile.income.monthlyTotal,
      monthlyExpenses: totalExpenses,
      monthlyNet: net,
      currentSavings: profile.income.currentSavings,
      fixedCosts,
      flexibleCosts,
      trendDirection: improving ? "improving" : "flat"
    },
    cashflowTable: await getCashflowTable(),
    chart: {
      type: "pie",
      title: "Current Budget Mix",
      data: [
        { name: "家賃", value: latestCashflow.rent },
        { name: "食費", value: latestCashflow.food },
        { name: "コンビニ", value: latestCashflow.convenienceStore },
        { name: "交通", value: latestCashflow.transport },
        { name: "光熱", value: latestCashflow.utilities },
        { name: "通信", value: latestCashflow.phone },
        { name: "娯楽", value: latestCashflow.entertainment },
        { name: "サブスク", value: latestCashflow.subscriptionsTotal },
        { name: "雑費", value: latestCashflow.misc }
      ]
    }
  };
}

module.exports = {
  getDashboard
};

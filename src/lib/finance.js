function monthlyExpenseTotal(expenses) {
  return (
    expenses.rent +
    expenses.food +
    expenses.convenienceStore +
    expenses.transport +
    expenses.utilities +
    expenses.phone +
    expenses.entertainment +
    expenses.subscriptionsTotal +
    expenses.misc
  );
}

function monthlyNet(profile) {
  return profile.income.monthlyTotal - monthlyExpenseTotal(profile.expenses);
}

function runwayMonths(savings, monthlyNetValue) {
  if (monthlyNetValue >= 0) {
    return 12;
  }

  return Number((savings / Math.abs(monthlyNetValue)).toFixed(1));
}

function riskLevel(projectedRunwayMonths) {
  if (projectedRunwayMonths >= 6) {
    return "low";
  }
  if (projectedRunwayMonths >= 3) {
    return "medium";
  }
  return "high";
}

function yen(value) {
  return `${value.toLocaleString("ja-JP")}円`;
}

module.exports = {
  monthlyExpenseTotal,
  monthlyNet,
  runwayMonths,
  riskLevel,
  yen
};

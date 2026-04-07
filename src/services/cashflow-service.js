const { getMonthlyCashflows } = require("./tidb-service");

async function getCashflows() {
  return getMonthlyCashflows();
}

async function getLatestCashflow() {
  const cashflows = await getCashflows();
  return cashflows[cashflows.length - 1];
}

async function getCashflowTable() {
  const cashflows = await getCashflows();
  return cashflows.map((row) => ({
    targetMonth: row.targetMonth,
    incomeTotal: row.incomeTotal,
    totalExpenses:
      row.rent +
      row.food +
      row.convenienceStore +
      row.transport +
      row.utilities +
      row.phone +
      row.entertainment +
      row.subscriptionsTotal +
      row.misc,
    savingsDelta: row.savingsDelta,
    note: row.note
  }));
}

module.exports = {
  getCashflows,
  getLatestCashflow,
  getCashflowTable
};
